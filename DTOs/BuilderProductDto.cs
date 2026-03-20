namespace BackendAPI.DTOs
{
    // DTO for PC Builder API responses
    public class BuilderProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Image { get; set; }
        public string ComponentType { get; set; }
    }
}

