namespace SwiftGrid.Entities;

/// <summary>
/// 필터 연산자 열거형
/// 필터링 시 사용할 수 있는 비교 연산자를 정의합니다.
/// </summary>
public enum FilterOperator
{
    /// <summary>
    /// 같음 (Equal) - 필드 값이 지정된 값과 정확히 일치하는 경우
    /// 예: Age = 25
    /// </summary>
    Equal,

    /// <summary>
    /// 같지 않음 (Not Equal) - 필드 값이 지정된 값과 일치하지 않는 경우
    /// 예: Age != 25
    /// </summary>
    NotEqual,

    /// <summary>
    /// 포함 (Like) - 필드 값이 지정된 문자열을 포함하는 경우 (대소문자 구분 안 함)
    /// 예: Name에 "홍"이 포함된 경우
    /// </summary>
    Like,

    /// <summary>
    /// 큼 (Greater Than) - 필드 값이 지정된 값보다 큰 경우
    /// 예: Age > 25
    /// </summary>
    GreaterThan,

    /// <summary>
    /// 크거나 같음 (Greater Than or Equal) - 필드 값이 지정된 값보다 크거나 같은 경우
    /// 예: Age >= 25
    /// </summary>
    GreaterThanOrEqual,

    /// <summary>
    /// 작음 (Less Than) - 필드 값이 지정된 값보다 작은 경우
    /// 예: Age < 25
    /// </summary>
    LessThan,

    /// <summary>
    /// 작거나 같음 (Less Than or Equal) - 필드 값이 지정된 값보다 작거나 같은 경우
    /// 예: Age <= 25
    /// </summary>
    LessThanOrEqual,

    /// <summary>
    /// 포함됨 (In) - 필드 값이 지정된 값 목록에 포함되는 경우
    /// 예: Department가 ["개발팀", "인사팀"] 중 하나인 경우
    /// </summary>
    In,

    /// <summary>
    /// 포함되지 않음 (Not In) - 필드 값이 지정된 값 목록에 포함되지 않는 경우
    /// 예: Department가 ["개발팀", "인사팀"]에 없는 경우
    /// </summary>
    NotIn
}

