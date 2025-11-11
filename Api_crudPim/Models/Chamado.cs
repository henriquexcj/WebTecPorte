using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Necessário para [Table] e [Column]

namespace Api_crudPim.Models
{
    [Table("Chamados")] // Força o EF a mapear para a tabela correta no banco
    public class Chamados
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // 👈 Gera ID automático no SQL
        [Column("ID")]
        public int ID { get; set; }

        [Column("UsuarioID")]
        [Required]
        public int UsuarioID { get; set; }

        [Column("CategoriaID")]
        public int? CategoriaID { get; set; }

        [Required]
        [Column("Titulo")]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [Column("Descricao")]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [RegularExpression("Aberto|Em andamento|Aguardando resposta|Resolvido|Fechado|Concluído",
            ErrorMessage = "Status inválido. Use: Aberto, Em andamento, Aguardando resposta, Resolvido, Fechado ou Concluído.")]
        [Column("Status")]
        public string Status { get; set; } = "Aberto";

        [Required]
        [RegularExpression("Baixa|Média|Alta|Urgente",
            ErrorMessage = "Prioridade inválida. Use: Baixa, Média, Alta ou Urgente.")]
        [Column("Prioridade")]
        public string Prioridade { get; set; } = "Baixa";

        [Column("DataCriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.Now;

        [Column("DataAtualizacao")]
        public DateTime DataAtualizacao { get; set; } = DateTime.Now;
    }
}
