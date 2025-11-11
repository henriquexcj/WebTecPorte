using Api_crudPim.Data;
using Api_crudPim.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api_crudPim.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChamadosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChamadosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Chamados>>> GetChamados()
        {
            return await _context.Chamados
                .OrderByDescending(c => c.DataCriacao)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Chamados>> GetChamado(int id)
        {
            var chamado = await _context.Chamados.FindAsync(id);
            if (chamado == null) return NotFound();

            var usuario = await _context.Usuarios.FindAsync(chamado.UsuarioID);
            if (usuario == null) return NotFound();

            var aluno = await _context.Alunos.FindAsync(usuario.ID);
            if (aluno == null) return NotFound();

            var curso = await _context.Cursos.FindAsync(aluno.CursoID);
            if (curso == null) return NotFound();

            var categoria = await _context.Categorias.FindAsync(chamado.CategoriaID);
            if (categoria == null) return NotFound();

            var dados = new
            {
                id = chamado.ID,
                titulo = chamado.Titulo,
                descricao = chamado.Descricao,
                prioridade = chamado.Prioridade,
                status = chamado.Status,
                dataCriacao = chamado.DataCriacao,
                dataAtualizacao = chamado.DataAtualizacao,
                ra = aluno.RegistroAluno,
                nomeUsuario = aluno.Nome,
                emailUsuario = usuario.Email,
                curso = curso.NomeCurso,
                categoria = categoria.NomeCategoria
            };

            return Ok(dados);
        }

        [HttpPost]
        public async Task<ActionResult<Chamados>> PostChamado([FromBody] Chamados chamado)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Chamados.Add(chamado);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetChamado), new { id = chamado.ID }, chamado);
            }
            catch (DbUpdateException ex)
            {
                var inner = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new
                {
                    error = "Erro ao salvar chamado. Verifique os campos Status, Prioridade e IDs relacionados.",
                    detalhes = inner
                });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutChamado(int id, [FromBody] Chamados chamado)
        {
            if (id != chamado.ID)
                return BadRequest(new { error = "ID do chamado não corresponde ao parâmetro da URL." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            //_context.Entry(chamado).State = EntityState.Modified;



            try
            {
                //await _context.SaveChangesAsync();

                var linhas = await _context.Chamados
                    .Where(c => c.ID == id)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(c => c.Titulo, chamado.Titulo)
                        .SetProperty(c => c.Descricao, chamado.Descricao)
                        .SetProperty(c => c.Status, chamado.Status)
                        .SetProperty(c => c.Prioridade, chamado.Prioridade)
                    );

                if (linhas == 0)
                    return NotFound();

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                var inner = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new
                {
                    error = "Erro ao atualizar chamado. Verifique os campos Status, Prioridade e IDs relacionados.",
                    detalhes = inner
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChamado(int id)
        {
            var chamado = await _context.Chamados.FindAsync(id);
            if (chamado == null) return NotFound();

            _context.Chamados.Remove(chamado);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
