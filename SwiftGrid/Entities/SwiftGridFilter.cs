namespace SwiftGrid.Entities;

/// <summary>
/// SwiftGrid의 필터 정보를 나타내는 클래스입니다.
/// 
/// 사용 예시:
/// <code>
/// // 나이가 25세 이상인 경우
/// var filter = new SwiftGridFilter 
/// { 
///     Field = "Age", 
///     Operator = FilterOperator.GreaterThanOrEqual, 
///     Value = 25 
/// };
/// 
/// // 이름에 "홍"이 포함된 경우
/// var nameFilter = new SwiftGridFilter 
/// { 
///     Field = "Name", 
///     Operator = FilterOperator.Like, 
///     Value = "홍" 
/// };
/// </code>
/// </summary>
public class SwiftGridFilter
{
    /// <summary>
    /// 필터링할 데이터 필드명
    /// 예: "Name", "Age", "Email" 등
    /// </summary>
    public string Field { get; set; } = "";

    /// <summary>
    /// 필터 연산자
    /// 기본값: Equal (같음)
    /// 
    /// 사용 가능한 연산자:
    /// - Equal: 같음 (예: Age = 25)
    /// - NotEqual: 같지 않음 (예: Age != 25)
    /// - Like: 포함 (예: Name에 "홍" 포함)
    /// - GreaterThan: 큼 (예: Age > 25)
    /// - GreaterThanOrEqual: 크거나 같음 (예: Age >= 25)
    /// - LessThan: 작음 (예: Age < 25)
    /// - LessThanOrEqual: 작거나 같음 (예: Age <= 25)
    /// - In: 포함됨 (예: Department가 ["개발팀", "인사팀"] 중 하나)
    /// - NotIn: 포함되지 않음
    /// </summary>
    public FilterOperator Operator { get; set; } = FilterOperator.Equal;

    /// <summary>
    /// 필터 값
    /// 연산자에 따라 비교할 값입니다.
    /// 
    /// 예시:
    /// - 숫자: 25, 100 등
    /// - 문자열: "홍길동", "개발팀" 등
    /// - 배열 (In/NotIn 연산자 사용 시): new[] { "개발팀", "인사팀" }
    /// </summary>
    public object? Value { get; set; }

    /// <summary>
    /// 레거시 호환성을 위한 Op 속성 (문자열 형식)
    /// 내부적으로 Operator enum으로 변환됩니다.
    /// </summary>
    [Obsolete("Operator 속성을 사용하세요. 이 속성은 레거시 호환성을 위해 유지됩니다.")]
    public string Op
    {
        get => Operator.ToString().ToLowerInvariant() switch
        {
            "equal" => "eq",
            "notequal" => "neq",
            "like" => "like",
            "greaterthan" => "gt",
            "greaterthanorequal" => "gte",
            "lessthan" => "lt",
            "lessthanorequal" => "lte",
            "in" => "in",
            "notin" => "nin",
            _ => "eq"
        };
        set => Operator = value?.ToLowerInvariant() switch
        {
            "eq" => FilterOperator.Equal,
            "neq" => FilterOperator.NotEqual,
            "like" => FilterOperator.Like,
            "gt" => FilterOperator.GreaterThan,
            "gte" => FilterOperator.GreaterThanOrEqual,
            "lt" => FilterOperator.LessThan,
            "lte" => FilterOperator.LessThanOrEqual,
            "in" => FilterOperator.In,
            "nin" => FilterOperator.NotIn,
            _ => FilterOperator.Equal
        };
    }
}

