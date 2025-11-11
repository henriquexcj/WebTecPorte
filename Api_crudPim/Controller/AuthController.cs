using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api_crudPim.Data;
using Api_crudPim.Models;
using Api_crudPim.DTOs;
using Api_crudPim.Services;
using BCrypt.Net;

namespace Api_crudPim.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email já cadastrado.");

            var usuario = new Usuarios
            {
                Email = dto.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
                Papel = dto.Papel
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            // Cria aluno ou funcionário conforme papel
            if (dto.Papel == "Aluno")
            {
                var curso = await _context.Cursos.FirstOrDefaultAsync();
                if (curso != null)
                {
                    _context.Alunos.Add(new Alunos
                    {
                        UsuarioID = usuario.ID,
                        Nome = dto.Nome,
                        RegistroAluno = usuario.ID.ToString("0000000"),
                        CursoID = curso.ID
                    });
                }
            }
            else if (dto.Papel == "Funcionario")
            {
                _context.Funcionarios.Add(new Funcionarios
                {
                    UsuarioID = usuario.ID,
                    Nome = dto.Nome,
                    MatriculaFuncionario = "FUNC" + usuario.ID.ToString("000")
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuário registrado com sucesso!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (usuario == null) return Unauthorized("Usuário não encontrado.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
                return Unauthorized("Senha incorreta.");

            var token = _tokenService.GenerateToken(usuario);
            return Ok(new { token, usuario.Email, usuario.Papel });
        }
    }
}
