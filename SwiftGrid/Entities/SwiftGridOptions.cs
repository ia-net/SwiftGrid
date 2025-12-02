namespace SwiftGrid.Entities
{
    public class SwiftGridOptions
    {
        public string Layout { get; set; } = "fitColumns";
        public string? Height { get; set; }
        public int Selectable { get; set; } = 1;
    }
}
