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
    title: 'Review a workplace before accepting a role.',
    intro: 'A record where workers may log patterns encountered at a workplace, so that others may review it before accepting a role there. No names and no accounts are published: only the type of issue and how often it has been logged.',
    privacyTitle: 'Why there are no stories here',
    privacyBody: 'A written account concerning a named workplace may identify its author and may create legal exposure. This record therefore accepts only the defined issue types: sufficient to serve as a warning, but not sufficient to identify who submitted it.',
    prototypeNote: 'Prototype: any report you add remains on this device only. Nothing has been transmitted and no other person can view it. A production version would require a server under RMWC’s control, together with moderation by RMWC.',
    searchLabel: 'Search by workplace or suburb',
    searchPlaceholder: 'For example: Cabramatta',
    resultsTitle: 'Workplaces recorded to date',
    sampleBadge: 'Sample data',
    yoursBadge: 'Includes your report',
    reportCount: count => `Logged by ${count} ${count === 1 ? 'worker' : 'workers'}`,
    onlyOne: 'Only one report has been submitted, which is not sufficient to establish a pattern. Please treat this as a matter to enquire about rather than a conclusion.',
    patternCount: count => `${count}×`,
    noResults: 'No matching record was found. The absence of a record does not indicate that a workplace is compliant; it indicates only that nothing has been logged.',
    emptyBoard: 'No records have been logged yet.',
    addTitle: 'Add a report',
    addNote: 'Please add only a workplace at which you have worked. No name and no exact date are required.',
    employerLabel: 'Workplace name',
    employerPlaceholder: 'Name of the shop, restaurant or company…',
    suburbLabel: 'Suburb (optional)',
    suburbPlaceholder: 'For example: Bankstown',
    patternsLabel: 'Which issues did you encounter there?',
    submit: 'Add report',
    submitted: 'The report has been added to the record on this device.',
    needName: 'Please enter the name of the workplace.',
    needPattern: 'Please select at least one issue type.',
    rulesTitle: 'How to interpret this record',
    rules: [
      'These entries are matters reported by workers, not verified findings.',
      'A workplace with no entries is not, for that reason, compliant.',
      'Several reports of the same issue indicate that careful enquiry is warranted before accepting a role.',
      'If you work at a workplace listed here, those entries do not automatically apply to you. Please contact RMWC regarding your own circumstances.',
    ],
    clear: 'Delete the reports I have submitted',
    back: 'Back',
    months: 'Periods recorded',
  },
};
