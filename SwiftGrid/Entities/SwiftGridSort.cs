namespace SwiftGrid.Entities;

/// <summary>SwiftGrid 정렬 정보</summary>
public class SwiftGridSort
{
    /// <summary>정렬할 데이터 필드명</summary>
    public string Field { get; set; } = "";

    /// <summary>정렬 방향</summary>
    public SortDirection Direction { get; set; } = SortDirection.Ascending;

    /// <summary>레거시 호환성을 위한 Dir 속성 (문자열 형식)</summary>
    [Obsolete("Direction 속성을 사용하세요.")]
    public string Dir
    {
        get => Direction == SortDirection.Ascending ? "asc" : "desc";
        set => Direction = value?.ToLowerInvariant() == "desc" 
            ? SortDirection.Descending 
            : SortDirection.Ascending;
    }
}
