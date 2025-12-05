namespace SwiftGrid.Entities;

/// <summary>SwiftGrid 옵션 설정</summary>
public class SwiftGridOptions
{
    /// <summary>테이블 레이아웃 모드 ("fitColumns", "fitData" 등, 기본값: "fitColumns")</summary>
    public string Layout { get; set; } = "fitColumns";

    /// <summary>테이블 높이 (CSS 값, 예: "400px", "100%")</summary>
    public string? Height { get; set; }

    /// <summary>행 선택 모드 (0: 비활성화, 1: 단일 선택, 숫자: 다중 선택 최대 개수)</summary>
    public int Selectable { get; set; } = 1;

    /// <summary>페이지네이션 활성화 여부</summary>
    public bool Pagination { get; set; } = false;

    /// <summary>페이지당 표시할 행 수</summary>
    public int? PaginationSize { get; set; }

    /// <summary>페이지네이션 모드 ("local": 클라이언트 측, "remote": 서버 측)</summary>
    public string PaginationMode { get; set; } = "local";

    /// <summary>페이지네이션 카운터 표시 여부</summary>
    public bool? PaginationCounter { get; set; }

    /// <summary>페이지 크기 선택기 표시 여부</summary>
    public bool? PaginationSizeSelector { get; set; }

    /// <summary>페이지네이션 버튼 개수</summary>
    public int? PaginationButtonCount { get; set; }

    /// <summary>편집 히스토리 활성화 여부 (Undo/Redo)</summary>
    public bool History { get; set; } = false;

    /// <summary>편집 트리거 이벤트 ("click" 또는 "focus")</summary>
    public string? EditTriggerEvent { get; set; }

    /// <summary>클립보드 기능 활성화 여부 (true, "copy", "paste" 등)</summary>
    public object? Clipboard { get; set; }

    /// <summary>클립보드 복사 범위 ("selected", "active", "visible", "all")</summary>
    public string? ClipboardCopyRowRange { get; set; } = "selected";

    /// <summary>체크박스를 통한 행 선택 활성화 여부</summary>
    public bool EnableRowSelectionCheckbox { get; set; } = false;

    /// <summary>전체 선택 체크박스 클릭 시 선택 범위 ("active", "visible", "all")</summary>
    public string? RowSelectionRange { get; set; } = "active";

    /// <summary>행 컨텍스트 메뉴 활성화 여부</summary>
    public bool EnableRowContextMenu { get; set; } = false;

    /// <summary>옵션의 유효성을 검사합니다</summary>
    public void Validate()
    {
        if (Pagination && PaginationSize.HasValue && PaginationSize.Value <= 0)
            throw new ArgumentException("PaginationSize must be greater than 0 when Pagination is enabled.", nameof(PaginationSize));

        if (!string.IsNullOrWhiteSpace(PaginationMode) && 
            PaginationMode != "local" && PaginationMode != "remote")
            throw new ArgumentException("PaginationMode must be either 'local' or 'remote'.", nameof(PaginationMode));

        if (PaginationButtonCount.HasValue && PaginationButtonCount.Value < 1)
            throw new ArgumentException("PaginationButtonCount must be at least 1.", nameof(PaginationButtonCount));
    }
}
