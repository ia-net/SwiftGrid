namespace SwiftGrid.Entities
{
    public class SwiftGridColumnDefinition
    {
        public string Field { get; set; } = default!;
        public string Title { get; set; } = default!;
        public bool Sortable { get; set; } = false;
        public bool Visible { get; set; } = true;
        public string? Formatter { get; set; }
        public int? Width { get; set; }
    }
}
