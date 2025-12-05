namespace SwiftGrid.Entities;

/// <summary>SwiftGrid 필터 정보</summary>
public class SwiftGridFilter
{
    /// <summary>필터링할 데이터 필드명</summary>
    public string Field { get; set; } = "";

    /// <summary>필터 연산자</summary>
    public FilterOperator Operator { get; set; } = FilterOperator.Equal;

    /// <summary>필터 값</summary>
    public object? Value { get; set; }

    /// <summary>레거시 호환성을 위한 Op 속성 (문자열 형식)</summary>
    [Obsolete("Operator 속성을 사용하세요.")]
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
