namespace SwiftGrid.Entities;

/// <summary>필터 연산자</summary>
public enum FilterOperator
{
    /// <summary>같음 (=)</summary>
    Equal,

    /// <summary>같지 않음 (!=)</summary>
    NotEqual,

    /// <summary>포함 (LIKE)</summary>
    Like,

    /// <summary>큼 (>)</summary>
    GreaterThan,

    /// <summary>크거나 같음 (>=)</summary>
    GreaterThanOrEqual,

    /// <summary>작음 (<)</summary>
    LessThan,

    /// <summary>작거나 같음 (<=)</summary>
    LessThanOrEqual,

    /// <summary>포함됨 (IN)</summary>
    In,

    /// <summary>포함되지 않음 (NOT IN)</summary>
    NotIn
}
