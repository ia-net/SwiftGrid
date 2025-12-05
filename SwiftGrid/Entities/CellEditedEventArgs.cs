namespace SwiftGrid.Entities;

/// <summary>셀 편집 이벤트 파라미터 (OnCellEdited 이벤트에서 전달)</summary>
/// <typeparam name="TItem">행 데이터 타입</typeparam>
public class CellEditedEventArgs<TItem>
{
    /// <summary>편집된 데이터 필드명</summary>
    public string Field { get; set; } = default!;

    /// <summary>편집 후의 새로운 값</summary>
    public object? Value { get; set; }

    /// <summary>편집 전의 이전 값</summary>
    public object? OldValue { get; set; }

    /// <summary>편집된 행의 전체 데이터 객체</summary>
    public TItem Row { get; set; } = default!;
}
