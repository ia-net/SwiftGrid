namespace SwiftGrid.Entities;

/// <summary>SwiftGrid 쿼리 상태 (OnQueryChanged 이벤트에서 전달)</summary>
public class SwiftGridQuery
{
    /// <summary>현재 페이지 번호 (1부터 시작)</summary>
    public int Page { get; set; } = 1;

    /// <summary>페이지당 표시할 행 수</summary>
    public int PageSize { get; set; } = 10;

    /// <summary>정렬 정보 목록</summary>
    public List<SwiftGridSort> Sorts { get; set; } = new();

    /// <summary>필터 정보 목록</summary>
    public List<SwiftGridFilter> Filters { get; set; } = new();

    /// <summary>전역 검색어</summary>
    public string? GlobalSearch { get; set; }
}
