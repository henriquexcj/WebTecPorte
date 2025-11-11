using Microsoft.EntityFrameworkCore;
using Api_crudPim.Models;

namespace Api_crudPim.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuarios> Usuarios { get; set; }
        public DbSet<Alunos> Alunos { get; set; }
        public DbSet<Funcionarios> Funcionarios { get; set; }
        public DbSet<Chamados> Chamados { get; set; }
        public DbSet<Respostas> Respostas { get; set; }
        public DbSet<Categorias> Categorias { get; set; }
        public DbSet<Cursos> Cursos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // ======== USUÁRIOS ========
            modelBuilder.Entity<Usuarios>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.Email).HasColumnName("Email").IsRequired();
                entity.Property(e => e.SenhaHash).HasColumnName("SenhaHash").IsRequired();
                entity.Property(e => e.Papel).HasColumnName("Papel").IsRequired();
                entity.Property(e => e.DataCadastro).HasColumnName("DataCadastro");
            });

            // ======== ALUNOS ========
            modelBuilder.Entity<Alunos>(entity =>
            {
                entity.ToTable("Alunos");
                entity.HasKey(e => e.UsuarioID);
                entity.Property(e => e.UsuarioID).HasColumnName("UsuarioID");
                entity.Property(e => e.Nome).HasColumnName("Nome");
                entity.Property(e => e.RegistroAluno).HasColumnName("RegistroAluno");
                entity.Property(e => e.CursoID).HasColumnName("CursoID");

                entity.HasOne(e => e.Usuario)
                      .WithOne()
                      .HasForeignKey<Alunos>(e => e.UsuarioID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Curso)
                      .WithMany(c => c.Alunos)
                      .HasForeignKey(e => e.CursoID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ======== FUNCIONÁRIOS ========
            modelBuilder.Entity<Funcionarios>(entity =>
            {
                entity.ToTable("Funcionarios");
                entity.HasKey(e => e.UsuarioID);
                entity.Property(e => e.UsuarioID).HasColumnName("UsuarioID");
                entity.Property(e => e.Nome).HasColumnName("Nome");
                entity.Property(e => e.MatriculaFuncionario).HasColumnName("MatriculaFuncionario");

                entity.HasOne(e => e.Usuario)
                      .WithOne()
                      .HasForeignKey<Funcionarios>(e => e.UsuarioID)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ======== CURSOS ========
            modelBuilder.Entity<Cursos>(entity =>
            {
                entity.ToTable("Cursos");
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.NomeCurso).HasColumnName("NomeCurso");
            });

            // ======== CATEGORIAS ========
            modelBuilder.Entity<Categorias>(entity =>
            {
                entity.ToTable("Categorias");
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.NomeCategoria).HasColumnName("NomeCategoria");
            });

            // ======== CHAMADOS ========
            modelBuilder.Entity<Chamados>(entity =>
            {
                entity.ToTable("Chamados");
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.UsuarioID).HasColumnName("UsuarioID");
                entity.Property(e => e.CategoriaID).HasColumnName("CategoriaID");
                entity.Property(e => e.Titulo).HasColumnName("Titulo");
                entity.Property(e => e.Descricao).HasColumnName("Descricao");
                entity.Property(e => e.Status).HasColumnName("Status");
                entity.Property(e => e.Prioridade).HasColumnName("Prioridade");
                entity.Property(e => e.DataCriacao).HasColumnName("DataCriacao");
                entity.Property(e => e.DataAtualizacao).HasColumnName("DataAtualizacao");

                entity.HasOne<Usuarios>()
                      .WithMany(u => u.Chamados)
                      .HasForeignKey(c => c.UsuarioID)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Categorias>()
                      .WithMany(cat => cat.Chamados)
                      .HasForeignKey(c => c.CategoriaID)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ======== RESPOSTAS ========
            modelBuilder.Entity<Respostas>(entity =>
            {
                entity.ToTable("Respostas");
                entity.HasKey(e => e.ID);
                entity.Property(e => e.ID).HasColumnName("ID");
                entity.Property(e => e.ChamadoID).HasColumnName("ChamadoID");
                entity.Property(e => e.UsuarioID).HasColumnName("UsuarioID");
                entity.Property(e => e.Mensagem).HasColumnName("Mensagem");
                entity.Property(e => e.DataEnvio).HasColumnName("DataEnvio");

                entity.ToTable(tb => tb.HasTrigger("trg_AtualizaDataChamadoEmResposta"));
            });
        }
    }
}
