namespace SwiftGrid.Entities;

/// <summary>
/// 셀 편집 이벤트 파라미터를 나타냅니다.
/// 
/// OnCellEdited 이벤트 핸들러에서 이 클래스를 사용하여 
/// 편집된 셀의 정보를 확인할 수 있습니다.
/// 
/// 사용 예시:
/// <code>
/// private async Task HandleCellEdited(CellEditedEventArgs&lt;Person&gt; args)
/// {
///     Console.WriteLine($"필드: {args.Field}");
///     Console.WriteLine($"이전 값: {args.OldValue}");
///     Console.WriteLine($"새 값: {args.Value}");
///     
///     // 편집된 행의 전체 데이터에 접근
///     var person = args.Row;
///     Console.WriteLine($"편집된 사람: {person.Name}");
///     
///     // 데이터베이스에 저장하는 로직 등...
/// }
/// </code>
/// </summary>
/// <typeparam name="TItem">행 데이터 타입 (예: Person, Product 등)</typeparam>
public class CellEditedEventArgs<TItem>
{
    /// <summary>
    /// 편집된 데이터 필드명
    /// 예: "Name", "Age", "Email" 등
    /// </summary>
    public string Field { get; set; } = default!;

    /// <summary>
    /// 편집 후의 새로운 값
    /// 사용자가 입력한 최종 값입니다.
    /// </summary>
    public object? Value { get; set; }

    /// <summary>
    /// 편집 전의 이전 값
    /// 편집 취소(Undo) 기능을 구현할 때 사용할 수 있습니다.
    /// </summary>
    public object? OldValue { get; set; }

    /// <summary>
    /// 편집된 행의 전체 데이터 객체
    /// 편집된 셀이 속한 행의 모든 데이터에 접근할 수 있습니다.
    /// 
    /// 예시:
    /// <code>
    /// var person = args.Row;
    /// Console.WriteLine($"ID: {person.Id}, Name: {person.Name}, Age: {person.Age}");
    /// </code>
    /// </summary>
    public TItem Row { get; set; } = default!;
}
