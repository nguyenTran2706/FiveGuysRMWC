import type { Language } from '../types';

interface WatchCopy {
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  privacyTitle: string;
  privacyBody: string;
  prototypeNote: string;
  searchLabel: string;
  searchPlaceholder: string;
  resultsTitle: string;
  sampleBadge: string;
  yoursBadge: string;
  reportCount: (count: number) => string;
  onlyOne: string;
  patternCount: (count: number) => string;
  noResults: string;
  emptyBoard: string;
  addTitle: string;
  addNote: string;
  employerLabel: string;
  employerPlaceholder: string;
  suburbLabel: string;
  suburbPlaceholder: string;
  patternsLabel: string;
  submit: string;
  submitted: string;
  needName: string;
  needPattern: string;
  rulesTitle: string;
  rules: string[];
  clear: string;
  back: string;
  months: string;
}

export const watchCopy: Record<Language, WatchCopy> = {
  vi: {
    navLabel: 'Cảnh báo cộng đồng',
    eyebrow: 'DO NGƯỜI LAO ĐỘNG GHI LẠI, KHÔNG GHI TÊN AI',
    title: 'Xem trước khi nhận việc.',
    intro: 'Một chỗ để người lao động ghi lại những mẫu hình đã gặp ở một nơi làm việc, để người sau có thể xem trước khi nhận việc ở đó. Không có tên người, không có lời kể — chỉ có loại vấn đề và số lần được ghi nhận.',
    privacyTitle: 'Vì sao ở đây không có lời kể',
    privacyBody: 'Một đoạn kể về một nơi làm việc cụ thể có thể khiến người viết bị nhận ra, và có thể khiến bạn gặp rắc rối pháp lý. Nên phần này chỉ nhận các loại vấn đề có sẵn — đủ để cảnh báo, không đủ để chỉ ra ai đã ghi.',
    prototypeNote: 'Bản thử nghiệm: báo cáo bạn thêm chỉ được lưu trên thiết bị này, chưa gửi tới đâu và chưa ai khác thấy được. Muốn dùng thật thì cần một máy chủ do RMWC quản lý, và cần RMWC duyệt nội dung.',
    searchLabel: 'Tìm nơi làm việc hoặc khu vực',
    searchPlaceholder: 'Ví dụ: Cabramatta',
    resultsTitle: 'Những nơi đã được ghi nhận',
    sampleBadge: 'Dữ liệu mẫu',
    yoursBadge: 'Có báo cáo của bạn',
    reportCount: count => `${count} người đã ghi nhận`,
    onlyOne: 'Mới có một báo cáo — chưa đủ để gọi là mẫu hình. Hãy xem đây là điều nên hỏi kỹ, không phải kết luận.',
    patternCount: count => `${count} lần`,
    noResults: 'Không tìm thấy nơi nào khớp. Chưa có ghi nhận không có nghĩa là nơi đó ổn — chỉ là chưa ai ghi lại.',
    emptyBoard: 'Chưa có ghi nhận nào.',
    addTitle: 'Thêm một ghi nhận',
    addNote: 'Chỉ thêm nơi bạn từng làm. Không cần tên bạn, không cần ngày cụ thể.',
    employerLabel: 'Tên nơi làm việc',
    employerPlaceholder: 'Tên tiệm, nhà hàng, công ty…',
    suburbLabel: 'Khu vực (không bắt buộc)',
    suburbPlaceholder: 'Ví dụ: Bankstown',
    patternsLabel: 'Bạn đã gặp vấn đề nào ở đó?',
    submit: 'Thêm ghi nhận',
    submitted: 'Đã thêm vào danh sách trên thiết bị này.',
    needName: 'Hãy ghi tên nơi làm việc.',
    needPattern: 'Hãy chọn ít nhất một loại vấn đề.',
    rulesTitle: 'Cách đọc phần này',
    rules: [
      'Đây là điều người lao động kể lại, không phải kết luận đã được kiểm chứng.',
      'Một nơi chưa có ghi nhận không có nghĩa là nơi đó ổn.',
      'Nhiều ghi nhận cùng một loại vấn đề là dấu hiệu nên hỏi kỹ trước khi nhận việc.',
      'Nếu bạn đang làm ở một nơi trong danh sách, điều đó không tự động đúng với bạn — hãy gọi RMWC để hỏi về trường hợp của mình.',
    ],
    clear: 'Xóa các ghi nhận tôi đã thêm',
    back: 'Quay lại',
    months: 'Thời gian được ghi nhận',
  },
  en: {
    navLabel: 'Community warnings',
    eyebrow: 'LOGGED BY WORKERS, WITH NO NAMES',
    title: 'Check before you take the job.',
    intro: 'A place for workers to log patterns they met at a workplace, so the next person can look before taking a job there. No names, no stories — only the kind of issue and how often it was logged.',
    privacyTitle: 'Why there are no stories here',
    privacyBody: 'A written account about a named workplace can identify whoever wrote it, and can expose you legally. So this board takes only the set issue types — enough to warn, not enough to point at who logged it.',
    prototypeNote: 'Prototype: a report you add stays on this device only. Nothing has been sent anywhere and nobody else can see it. A real version needs a server RMWC controls, and moderation by RMWC.',
    searchLabel: 'Search a workplace or suburb',
    searchPlaceholder: 'For example: Cabramatta',
    resultsTitle: 'Workplaces that have been logged',
    sampleBadge: 'Sample data',
    yoursBadge: 'Includes your report',
    reportCount: count => `${count} ${count === 1 ? 'person has' : 'people have'} logged this`,
    onlyOne: 'Only one report so far — not enough to call it a pattern. Treat it as something to ask about, not a conclusion.',
    patternCount: count => `${count}×`,
    noResults: 'No match found. Nothing logged does not mean a workplace is fine — only that nobody has logged it.',
    emptyBoard: 'Nothing has been logged yet.',
    addTitle: 'Add a report',
    addNote: 'Only add a place you worked at yourself. No name needed, no exact date.',
    employerLabel: 'Workplace name',
    employerPlaceholder: 'Shop, restaurant or company name…',
    suburbLabel: 'Suburb (optional)',
    suburbPlaceholder: 'For example: Bankstown',
    patternsLabel: 'What did you meet there?',
    submit: 'Add report',
    submitted: 'Added to the list on this device.',
    needName: 'Please enter the workplace name.',
    needPattern: 'Please select at least one issue type.',
    rulesTitle: 'How to read this',
    rules: [
      'These are things workers reported, not verified findings.',
      'A workplace with nothing logged is not therefore fine.',
      'Several reports of the same issue is a sign to ask carefully before taking the job.',
      'If you work at a place listed here, that does not automatically apply to you — call RMWC about your own situation.',
    ],
    clear: 'Delete the reports I added',
    back: 'Back',
    months: 'Logged in',
  },
};
