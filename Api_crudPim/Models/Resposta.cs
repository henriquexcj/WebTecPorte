using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Api_crudPim.Models
{
    [Table("Respostas")]
    public class Respostas
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [ForeignKey("Chamado")]
        public int ChamadoID { get; set; }

        [Required]
        [ForeignKey("Usuario")]
        public int UsuarioID { get; set; }
        
        [Required]
        [MaxLength(2000)]
        public string Mensagem { get; set; } = string.Empty;
        public DateTime DataEnvio { get; set; } = DateTime.Now;
    }
}
