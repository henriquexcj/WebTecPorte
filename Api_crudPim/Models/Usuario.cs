namespace Api_crudPim.Models
{
    public class Usuarios
    {
        public int ID { get; set; }
        public string Email { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;
        public string Papel { get; set; } = "Aluno";
        public DateTime DataCadastro { get; set; } = DateTime.Now;

        public ICollection<Chamados>? Chamados { get; set; }
    }
}
