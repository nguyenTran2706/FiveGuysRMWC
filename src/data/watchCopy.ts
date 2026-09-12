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
  flagTitle: string;
  flagIntro: string;
  flagCheckbox: string;
  flagPreviewLabel: string;
  flagPrototype: string;
  flagAdded: string;
  flagNoEmployer: string;
  flagNoPatterns: string;
}

export const watchCopy: Record<Language, WatchCopy> = {
  vi: {
    navLabel: 'Cảnh báo cộng đồng',
    eyebrow: 'DO NGƯỜI LAO ĐỘNG GHI LẠI, KHÔNG GHI TÊN AI',
    title: 'Tìm hiểu về nơi làm việc trước khi nhận việc.',
    intro: 'Đây là nơi người lao động ghi lại những vấn đề từng gặp tại một nơi làm việc, để người khác có thể tham khảo trước khi nhận việc ở đó. Không có tên người và không có lời kể; chỉ có loại vấn đề và số lần được ghi nhận.',
    privacyTitle: 'Vì sao ở đây không có lời kể',
    privacyBody: 'Một đoạn kể về một nơi làm việc cụ thể có thể khiến người viết bị nhận ra và có thể dẫn đến rủi ro pháp lý. Vì vậy, phần này chỉ tiếp nhận các loại vấn đề có sẵn: đủ để cảnh báo, nhưng không đủ để xác định ai đã ghi nhận.',
    prototypeNote: 'Bản thử nghiệm: ghi nhận bạn thêm chỉ được lưu trên thiết bị này, chưa được gửi đi và không ai khác xem được. Để triển khai chính thức, cần một máy chủ do RMWC quản lý cùng với quy trình kiểm duyệt nội dung của RMWC.',
    searchLabel: 'Tìm theo nơi làm việc hoặc khu vực',
    searchPlaceholder: 'Ví dụ: Cabramatta',
    resultsTitle: 'Các nơi làm việc đã được ghi nhận',
    sampleBadge: 'Dữ liệu mẫu',
    yoursBadge: 'Có báo cáo của bạn',
    reportCount: count => `Đã có ${count} người lao động ghi nhận`,
    onlyOne: 'Hiện chỉ có một ghi nhận, chưa đủ để xác định thành mẫu hình. Vui lòng xem đây là điều nên tìm hiểu kỹ, không phải một kết luận.',
    patternCount: count => `${count} lần`,
    noResults: 'Không tìm thấy nơi làm việc phù hợp. Việc chưa có ghi nhận không có nghĩa là nơi đó tuân thủ đúng quy định, mà chỉ có nghĩa là chưa ai ghi nhận.',
    emptyBoard: 'Chưa có ghi nhận nào được lưu.',
    addTitle: 'Thêm một ghi nhận',
    addNote: 'Vui lòng chỉ thêm nơi làm việc mà bạn từng làm. Không cần tên của bạn và không cần ngày cụ thể.',
    employerLabel: 'Tên nơi làm việc',
    employerPlaceholder: 'Tên tiệm, nhà hàng hoặc công ty…',
    suburbLabel: 'Khu vực (không bắt buộc)',
    suburbPlaceholder: 'Ví dụ: Bankstown',
    patternsLabel: 'Bạn đã gặp những vấn đề nào tại nơi đó?',
    submit: 'Thêm ghi nhận',
    submitted: 'Ghi nhận đã được thêm vào danh sách trên thiết bị này.',
    needName: 'Vui lòng nhập tên nơi làm việc.',
    needPattern: 'Vui lòng chọn ít nhất một loại vấn đề.',
    rulesTitle: 'Cách hiểu thông tin trong phần này',
    rules: [
      'Đây là những điều người lao động ghi nhận, không phải kết luận đã được kiểm chứng.',
      'Một nơi làm việc chưa có ghi nhận không vì thế mà được xem là tuân thủ đúng quy định.',
      'Nhiều ghi nhận về cùng một loại vấn đề là dấu hiệu cho thấy bạn nên tìm hiểu kỹ trước khi nhận việc.',
      'Nếu bạn đang làm tại một nơi có trong danh sách, những ghi nhận đó không tự động áp dụng cho bạn. Vui lòng liên hệ RMWC để được tư vấn về hoàn cảnh của mình.',
    ],
    clear: 'Xoá những ghi nhận tôi đã thêm',
    back: 'Quay lại',
    months: 'Thời gian ghi nhận',
    flagTitle: 'Ghi nhận nơi làm việc này vào Cảnh báo cộng đồng',
    flagIntro: 'Bạn có thể để người lao động khác biết về những vấn đề bạn đã gặp tại nơi làm việc này. Mục này hoàn toàn tự nguyện và mặc định đang tắt.',
    flagCheckbox: 'Thêm nơi làm việc này vào Cảnh báo cộng đồng.',
    flagPreviewLabel: 'Nội dung sẽ được thêm, và chỉ có bấy nhiêu',
    flagPrototype: 'Trong bản thử nghiệm này, ghi nhận chỉ được lưu trên thiết bị của bạn và không ai khác xem được. Lời kể, tiền lương, loại visa và thông tin liên lạc của bạn không bao giờ được thêm vào.',
    flagAdded: 'Đã thêm vào Cảnh báo cộng đồng trên thiết bị này. Bỏ đánh dấu để xoá.',
    flagNoEmployer: 'Mục này cần tên nơi làm việc. Bạn có thể điền ở phần "Nơi làm việc" bên trên nếu muốn.',
    flagNoPatterns: 'Mục này cần ít nhất một loại vấn đề bạn đã chọn ở Phần 2 của bộ câu hỏi.',
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
    flagTitle: 'Record this workplace in Community warnings',
    flagIntro: 'You may inform other workers of the issues you encountered at this workplace. This is entirely voluntary and is switched off by default.',
    flagCheckbox: 'Add this workplace to Community warnings.',
    flagPreviewLabel: 'The entry that would be added, and nothing further',
    flagPrototype: 'In this prototype, the entry is stored on your device only and no other person can view it. Your account, pay details, visa type and contact details are never included.',
    flagAdded: 'Added to Community warnings on this device. Clear the selection to remove it.',
    flagNoEmployer: 'This requires the name of the workplace. You may enter it in the “Workplace” section above if you wish.',
    flagNoPatterns: 'This requires at least one issue type, as selected in Part 2 of the questionnaire.',
  },
};
