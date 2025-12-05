namespace SwiftGrid.Entities;

/// <summary>
/// SwiftGrid의 옵션을 설정하는 클래스입니다.
/// 
/// 그리드의 동작 방식을 제어하는 다양한 설정을 포함합니다.
/// 
/// 사용 예시:
/// <code>
/// var options = new SwiftGridOptions
/// {
///     Layout = "fitColumns",
///     Height = "400px",
///     Pagination = true,
///     PaginationSize = 10,
///     Selectable = 1, // 단일 선택
///     History = true // Undo/Redo 활성화
/// };
/// 
/// &lt;SwiftGrid Data="@people" Options="@options"&gt;
///     ...
/// &lt;/SwiftGrid&gt;
/// </code>
/// </summary>
public class SwiftGridOptions
{
    /// <summary>
    /// 테이블 레이아웃 모드
    /// 컬럼 너비를 어떻게 조정할지 결정합니다.
    /// 
    /// 가능한 값:
    /// - "fitColumns": 컬럼 너비를 컨테이너에 맞춤 (기본값, 권장)
    /// - "fitData": 데이터 내용에 맞춰 컬럼 너비 자동 조정
    /// - "fitDataFill": fitData와 유사하지만 남은 공간을 채움
    /// - "fitDataStretch": fitDataFill과 유사하지만 스트레치 적용
    /// - "fitDataTable": 테이블 전체 너비에 맞춤
    /// </summary>
    public string Layout { get; set; } = "fitColumns";

    /// <summary>
    /// 테이블 높이 (CSS 값, 예: "400px", "100%")
    /// </summary>
    public string? Height { get; set; }

    /// <summary>
    /// 행 선택 모드
    /// 사용자가 행을 선택할 수 있는 방식을 설정합니다.
    /// 
    /// 가능한 값:
    /// - 0: 행 선택 비활성화
    /// - 1: 단일 행 선택 (기본값)
    /// - 숫자 (예: 10): 최대 선택 가능한 행 수 (다중 선택)
    /// - "highlight": 선택 비활성화, 하이라이트만 표시
    /// 
    /// 예시:
    /// <code>
    /// Selectable = 1,  // 단일 선택
    /// Selectable = 10, // 최대 10개까지 다중 선택
    /// Selectable = 0,  // 선택 비활성화
    /// </code>
    /// </summary>
    public int Selectable { get; set; } = 1;

    /// <summary>
    /// 페이지네이션 활성화 여부
    /// </summary>
    public bool Pagination { get; set; } = false;

    /// <summary>
    /// 페이지당 표시할 행 수
    /// Pagination이 true일 때만 유효합니다.
    /// </summary>
    public int? PaginationSize { get; set; } = null;

    /// <summary>
    /// 페이지네이션 모드
    /// 데이터를 어디서 페이지네이션할지 결정합니다.
    /// 
    /// - "local": 클라이언트 측 페이지네이션 (기본값)
    ///   모든 데이터를 한 번에 로드하고, 브라우저에서 페이지를 나눕니다.
    ///   작은 데이터셋에 적합합니다.
    /// 
    /// - "remote": 서버 측 페이지네이션
    ///   서버에서 필요한 페이지만 요청하여 가져옵니다.
    ///   큰 데이터셋에 적합하며, OnQueryChanged 이벤트를 사용합니다.
    /// 
    /// 예시:
    /// <code>
    /// // 로컬 모드 (모든 데이터를 한 번에 로드)
    /// PaginationMode = "local";
    /// 
    /// // 서버 모드 (서버에서 페이지만 요청)
    /// PaginationMode = "remote";
    /// </code>
    /// </summary>
    public string PaginationMode { get; set; } = "local";

    /// <summary>
    /// 페이지네이션 카운터 표시 여부
    /// true: "Showing 1-10 of 100 rows" 형식으로 표시
    /// false: 표시하지 않음
    /// null: 기본값 사용
    /// </summary>
    public bool? PaginationCounter { get; set; } = null;

    /// <summary>
    /// 페이지 크기 선택기 표시 여부
    /// 사용자가 페이지당 행 수를 변경할 수 있는 드롭다운 표시
    /// </summary>
    public bool? PaginationSizeSelector { get; set; } = null;

    /// <summary>
    /// 페이지네이션 버튼 개수
    /// 한 번에 표시할 페이지 번호 버튼의 개수
    /// </summary>
    public int? PaginationButtonCount { get; set; } = null;

    /// <summary>
    /// 편집 히스토리 활성화 여부
    /// true로 설정하면 undo/redo 기능이 활성화됩니다.
    /// </summary>
    public bool History { get; set; } = false;

    /// <summary>
    /// 편집 트리거 이벤트
    /// "click": 클릭 시 편집 시작
    /// "focus": 포커스 시 편집 시작 (기본값)
    /// </summary>
    public string? EditTriggerEvent { get; set; } = null;

    /// <summary>
    /// 클립보드 기능 활성화 여부
    /// true: 클립보드 복사/붙여넣기 활성화
    /// "copy": 복사만 활성화
    /// "paste": 붙여넣기만 활성화
    /// false: 비활성화 (기본값)
    /// </summary>
    public object? Clipboard { get; set; } = null;

    /// <summary>
    /// 클립보드 복사 범위
    /// "selected": 선택된 행만 복사 (기본값)
    /// "active": 현재 페이지의 활성 행만 복사
    /// "visible": 현재 보이는 행만 복사
    /// "all": 모든 행 복사
    /// </summary>
    public string? ClipboardCopyRowRange { get; set; } = "selected";

    /// <summary>
    /// 체크박스를 통한 행 선택 활성화 여부
    /// true로 설정하면 첫 번째 컬럼 앞에 체크박스 컬럼이 자동으로 추가됩니다.
    /// </summary>
    public bool EnableRowSelectionCheckbox { get; set; } = false;

    /// <summary>
    /// 전체 선택 체크박스 클릭 시 선택 범위
    /// "active": 현재 페이지의 행만 선택 (페이지네이션 사용 시 권장)
    /// "visible": 현재 보이는 행만 선택 (스크롤 영역에서 보이는 행)
    /// "all": 모든 행 선택
    /// </summary>
    public string? RowSelectionRange { get; set; } = "active";

    /// <summary>
    /// 행 컨텍스트 메뉴 활성화 여부
    /// true: 기본 컨텍스트 메뉴 활성화 (행 삭제, 클립보드 복사)
    /// false: 비활성화 (기본값)
    /// </summary>
    public bool EnableRowContextMenu { get; set; } = false;

    /// <summary>
    /// 옵션의 유효성을 검사합니다.
    /// </summary>
    /// <exception cref="ArgumentException">유효하지 않은 옵션 값인 경우</exception>
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
