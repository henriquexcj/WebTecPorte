using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api_crudPim.Models
{
    [Table("Categorias")]
    public class Categorias
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string NomeCategoria { get; set; } = string.Empty;

        // Relação: uma categoria pode ter vários chamados
        public ICollection<Chamados>? Chamados { get; set; }
    }
}
