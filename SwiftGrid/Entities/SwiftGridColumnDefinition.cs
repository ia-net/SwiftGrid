namespace SwiftGrid.Entities;

/// <summary>SwiftGrid 컬럼 정의 (SwiftGridColumn 컴포넌트에서 자동 생성)</summary>
public class SwiftGridColumnDefinition
{
    /// <summary>컬럼에 바인딩할 데이터 필드명</summary>
    public string Field { get; set; } = default!;

    /// <summary>컬럼 헤더에 표시할 제목</summary>
    public string Title { get; set; } = default!;

    /// <summary>정렬 가능 여부</summary>
    public bool Sortable { get; set; } = false;

    /// <summary>컬럼 표시 여부</summary>
    public bool Visible { get; set; } = true;

    /// <summary>데이터 포맷터 (Tabulator 포맷터 이름)</summary>
    public string? Formatter { get; set; }

    /// <summary>컬럼 너비 (픽셀 단위)</summary>
    public int? Width { get; set; }

    /// <summary>헤더 필터 활성화 여부</summary>
    public object? HeaderFilter { get; set; }

    /// <summary>헤더 필터 placeholder 텍스트</summary>
    public string? HeaderFilterPlaceholder { get; set; }

    /// <summary>헤더 필터 파라미터</summary>
    public object? HeaderFilterParams { get; set; }

    /// <summary>셀 편집 가능 여부</summary>
    public bool? Editable { get; set; }

    /// <summary>셀 편집기 타입</summary>
    public string? Editor { get; set; }

    /// <summary>셀 편집기 파라미터</summary>
    public object? EditorParams { get; set; }

    /// <summary>컬럼 정의의 유효성을 검사합니다</summary>
    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(Field))
            throw new ArgumentException("Field is required for SwiftGridColumnDefinition.", nameof(Field));

        if (string.IsNullOrWhiteSpace(Title))
            throw new ArgumentException("Title is required for SwiftGridColumnDefinition.", nameof(Title));
    }
}
