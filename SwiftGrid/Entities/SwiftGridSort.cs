namespace SwiftGrid.Entities;

/// <summary>
/// SwiftGrid의 정렬 정보를 나타내는 클래스입니다.
/// 
/// 사용 예시:
/// <code>
/// // 이름을 오름차순으로 정렬
/// var sort = new SwiftGridSort 
/// { 
///     Field = "Name", 
///     Direction = SortDirection.Ascending 
/// };
/// 
/// // 나이를 내림차순으로 정렬
/// var ageSort = new SwiftGridSort 
/// { 
///     Field = "Age", 
///     Direction = SortDirection.Descending 
/// };
/// </code>
/// </summary>
public class SwiftGridSort
{
    /// <summary>
    /// 정렬할 데이터 필드명
    /// 예: "Name", "Age", "Email" 등
    /// </summary>
    public string Field { get; set; } = "";

    /// <summary>
    /// 정렬 방향
    /// 기본값: Ascending (오름차순)
    /// 
    /// - Ascending: 오름차순 (작은 값 → 큰 값)
    ///   예: 숫자는 1, 2, 3... / 문자는 가, 나, 다... / 날짜는 과거 → 미래
    /// - Descending: 내림차순 (큰 값 → 작은 값)
    ///   예: 숫자는 10, 9, 8... / 문자는 하, 다, 나... / 날짜는 미래 → 과거
    /// </summary>
    public SortDirection Direction { get; set; } = SortDirection.Ascending;

    /// <summary>
    /// 레거시 호환성을 위한 Dir 속성 (문자열 형식)
    /// 내부적으로 Direction enum으로 변환됩니다.
    /// </summary>
    [Obsolete("Direction 속성을 사용하세요. 이 속성은 레거시 호환성을 위해 유지됩니다.")]
    public string Dir
    {
        get => Direction == SortDirection.Ascending ? "asc" : "desc";
        set => Direction = value?.ToLowerInvariant() == "desc" 
            ? SortDirection.Descending 
            : SortDirection.Ascending;
    }
}

