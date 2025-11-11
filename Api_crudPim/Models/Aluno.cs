using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api_crudPim.Models
{
    [Table("Alunos")]
    public class Alunos
    {
        [Key]
        [ForeignKey("Usuario")]
        public int UsuarioID { get; set; }

        [Required]
        [MaxLength(255)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(7)]
        public string RegistroAluno { get; set; } = string.Empty;

        [Required]
        public int CursoID { get; set; }

        // Relações
        public Usuarios? Usuario { get; set; }
        public Cursos? Curso { get; set; }
    }
}
