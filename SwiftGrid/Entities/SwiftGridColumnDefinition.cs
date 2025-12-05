namespace SwiftGrid.Entities;

/// <summary>
/// SwiftGrid 컬럼 정의를 나타냅니다.
/// 
/// 이 클래스는 SwiftGridColumn 컴포넌트에서 자동으로 생성되며,
/// 그리드에 표시될 컬럼의 속성을 정의합니다.
/// 
/// 일반적으로 직접 사용하지 않고, SwiftGridColumn 컴포넌트를 통해 사용합니다:
/// <code>
/// &lt;SwiftGridColumn Field="Name" Title="이름" Sortable="true" /&gt;
/// </code>
/// </summary>
public class SwiftGridColumnDefinition
{
    /// <summary>
    /// 컬럼에 바인딩할 데이터 필드명 (PascalCase 또는 camelCase)
    /// </summary>
    public string Field { get; set; } = default!;

    /// <summary>
    /// 컬럼 헤더에 표시할 제목
    /// </summary>
    public string Title { get; set; } = default!;

    /// <summary>
    /// 정렬 가능 여부
    /// </summary>
    public bool Sortable { get; set; } = false;

    /// <summary>
    /// 컬럼 표시 여부
    /// </summary>
    public bool Visible { get; set; } = true;

    /// <summary>
    /// 데이터 포맷터 (Tabulator 포맷터 이름 또는 함수)
    /// </summary>
    public string? Formatter { get; set; }

    /// <summary>
    /// 컬럼 너비 (픽셀 단위)
    /// </summary>
    public int? Width { get; set; }

    /// <summary>
    /// 헤더 필터 활성화 여부
    /// true로 설정하면 해당 컬럼의 헤더에 필터 입력 필드가 표시됩니다.
    /// "input", "number", "select" 등의 타입을 지정할 수도 있습니다.
    /// </summary>
    public object? HeaderFilter { get; set; } = null;

    /// <summary>
    /// 헤더 필터 placeholder 텍스트
    /// </summary>
    public string? HeaderFilterPlaceholder { get; set; } = null;

    /// <summary>
    /// 헤더 필터 파라미터 (select 타입의 경우 values 등)
    /// </summary>
    public object? HeaderFilterParams { get; set; } = null;

    /// <summary>
    /// 셀 편집 가능 여부
    /// true로 설정하면 해당 컬럼의 셀을 클릭하여 편집할 수 있습니다.
    /// </summary>
    public bool? Editable { get; set; } = null;

    /// <summary>
    /// 셀 편집기 타입
    /// "input", "textarea", "number", "select", "date" 등
    /// </summary>
    public string? Editor { get; set; } = null;

    /// <summary>
    /// 셀 편집기 파라미터
    /// </summary>
    public object? EditorParams { get; set; } = null;

    /// <summary>
    /// 컬럼 정의의 유효성을 검사합니다.
    /// </summary>
    /// <exception cref="ArgumentException">필수 필드가 비어있는 경우</exception>
    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Field))
            throw new ArgumentException("Field is required for SwiftGridColumnDefinition.", nameof(Field));

        if (string.IsNullOrWhiteSpace(Title))
            throw new ArgumentException("Title is required for SwiftGridColumnDefinition.", nameof(Title));
    }
}