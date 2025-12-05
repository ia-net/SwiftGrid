namespace SwiftGrid.Entities;

/// <summary>
/// 정렬 방향 열거형
/// 데이터를 정렬할 때 사용하는 방향을 정의합니다.
/// </summary>
public enum SortDirection
{
    /// <summary>
    /// 오름차순 (Ascending) - 작은 값부터 큰 값 순서로 정렬
    /// 예: 숫자는 1, 2, 3... / 문자는 가, 나, 다... / 날짜는 과거부터 미래 순서
    /// </summary>
    Ascending,

    /// <summary>
    /// 내림차순 (Descending) - 큰 값부터 작은 값 순서로 정렬
    /// 예: 숫자는 10, 9, 8... / 문자는 하, 다, 나... / 날짜는 미래부터 과거 순서
    /// </summary>
    Descending
}

