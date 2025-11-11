using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Api_crudPim.Data;
using Api_crudPim.Models;
using Api_crudPim.DTOs;

namespace Api_crudPim.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        
        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PostResposta([FromBody] RespostaDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Mensagem))
                return BadRequest("Mensagem não pode ser vazia.");

            var mensagem = new Respostas
            {
                ChamadoID = dto.ChamadoID,
                UsuarioID = dto.UsuarioID,
                Mensagem = dto.Mensagem,
                DataEnvio = DateTime.Now
            };

            _context.Respostas.Add(mensagem);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensagem.ID,
                mensagem.Mensagem,
                mensagem.DataEnvio,
                mensagem.UsuarioID,
                mensagem.ChamadoID
            });
        }

        [HttpGet("{ChamadoID}")]
        public async Task<IActionResult> GetMensagens(int ChamadoID)
        {
            var mensagens = await _context.Respostas
                .Where(m => m.ChamadoID == ChamadoID)
                .OrderBy(m => m.DataEnvio)
                .Select(m => new
                {
                    m.ID,
                    m.Mensagem,
                    m.DataEnvio,
                    m.UsuarioID
                })
                .ToListAsync();

            if (!mensagens.Any())
                return NotFound("Nenhuma mensagem encontrada.");

            return Ok(mensagens);
        }
    }
}
