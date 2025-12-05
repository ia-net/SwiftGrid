namespace SwiftGrid.Entities;

/// <summary>
/// SwiftGrid의 쿼리 상태를 나타내는 클래스입니다.
/// 
/// 이 클래스는 OnQueryChanged 이벤트에서 전달되며, 
/// 현재 그리드의 페이지네이션, 정렬, 필터, 검색 상태를 포함합니다.
/// 
/// 사용 예시:
/// <code>
/// private async Task HandleQueryChanged(SwiftGridQuery query)
/// {
///     // 현재 페이지 정보
///     Console.WriteLine($"현재 페이지: {query.Page}, 페이지 크기: {query.PageSize}");
///     
///     // 정렬 정보
///     foreach (var sort in query.Sorts)
///     {
///         Console.WriteLine($"{sort.Field} 필드를 {sort.Direction}로 정렬");
///     }
///     
///     // 필터 정보
///     foreach (var filter in query.Filters)
///     {
///         Console.WriteLine($"{filter.Field} 필드에 {filter.Operator} 연산자로 {filter.Value} 필터링");
///     }
///     
///     // 전역 검색어
///     if (!string.IsNullOrEmpty(query.GlobalSearch))
///     {
///         Console.WriteLine($"전역 검색어: {query.GlobalSearch}");
///     }
/// }
/// </code>
/// </summary>
public class SwiftGridQuery
{
    /// <summary>
    /// 현재 페이지 번호
    /// 1부터 시작합니다. (첫 번째 페이지 = 1)
    /// 
    /// 예: 1페이지, 2페이지, 3페이지...
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// 페이지당 표시할 행 수
    /// 한 페이지에 몇 개의 데이터 행을 표시할지 지정합니다.
    /// 
    /// 기본값: 10
    /// 예: 10, 25, 50, 100 등
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// 정렬 정보 목록
    /// 여러 컬럼에 대해 정렬을 적용할 수 있습니다.
    /// 
    /// 예시:
    /// <code>
    /// query.Sorts = new List&lt;SwiftGridSort&gt;
    /// {
    ///     new SwiftGridSort { Field = "Name", Direction = SortDirection.Ascending },
    ///     new SwiftGridSort { Field = "Age", Direction = SortDirection.Descending }
    /// };
    /// // 결과: 이름으로 먼저 오름차순 정렬, 같은 이름이면 나이로 내림차순 정렬
    /// </code>
    /// </summary>
    public List<SwiftGridSort> Sorts { get; set; } = new();

    /// <summary>
    /// 필터 정보 목록
    /// 여러 필터를 조합하여 데이터를 필터링할 수 있습니다.
    /// 
    /// 예시:
    /// <code>
    /// query.Filters = new List&lt;SwiftGridFilter&gt;
    /// {
    ///     new SwiftGridFilter { Field = "Age", Operator = FilterOperator.GreaterThanOrEqual, Value = 25 },
    ///     new SwiftGridFilter { Field = "Department", Operator = FilterOperator.Equal, Value = "개발팀" }
    /// };
    /// // 결과: 나이가 25세 이상이고 부서가 "개발팀"인 데이터만 표시
    /// </code>
    /// </summary>
    public List<SwiftGridFilter> Filters { get; set; } = new();

    /// <summary>
    /// 전역 검색어
    /// 모든 컬럼에서 검색할 키워드입니다.
    /// 
    /// null이거나 빈 문자열이면 전역 검색이 적용되지 않습니다.
    /// 
    /// 예: "홍길동", "개발팀" 등
    /// </summary>
    public string? GlobalSearch { get; set; }
}

