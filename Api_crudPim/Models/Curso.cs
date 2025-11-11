using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api_crudPim.Models
{
    [Table("Cursos")]
    public class Cursos
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(150)]
        public string NomeCurso { get; set; } = string.Empty;

        // Relação: um curso pode ter vários alunos
        public ICollection<Alunos>? Alunos { get; set; }
    }
}
