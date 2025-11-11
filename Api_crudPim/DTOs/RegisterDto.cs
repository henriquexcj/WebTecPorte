namespace Api_crudPim.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Papel { get; set; } = "Aluno"; // "Aluno", "Funcionario", "Admin"
        public string Nome { get; set; } = string.Empty;
    }
}
