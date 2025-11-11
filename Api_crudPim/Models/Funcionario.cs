using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api_crudPim.Models
{
    [Table("Funcionarios")]
    public class Funcionarios
    {
        [Key]
        [ForeignKey("Usuario")]
        public int UsuarioID { get; set; }

        [Required]
        [MaxLength(255)]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string MatriculaFuncionario { get; set; } = string.Empty;

        // Relação com usuário
        public Usuarios? Usuario { get; set; }
    }
}
