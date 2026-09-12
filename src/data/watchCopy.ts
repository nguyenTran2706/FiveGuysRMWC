import type { Language } from '../types';
import type { IndustryKey } from './employerReports';

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
  industryLabel: string;
  industryPlaceholder: string;
  industries: Record<IndustryKey, string>;
  suburbLabel: string;
  suburbPlaceholder: string;
  patternsLabel: string;
  submit: string;
  submitted: string;
  needIndustry: string;
  needSuburb: string;
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
  flagNoIndustry: string;
  flagNoPatterns: string;
}

export const watchCopy: Record<Language, WatchCopy> = {
  vi: {
    navLabel: 'Cảnh báo cộng đồng',
    eyebrow: 'DO NGƯỜI LAO ĐỘNG GHI LẠI, THEO NGÀNH VÀ KHU VỰC',
    title: 'Biết trước điều thường gặp trong ngành của bạn.',
    intro: 'Đây là nơi người lao động ghi lại những vấn đề từng gặp, gộp theo ngành và khu vực. Không có tên doanh nghiệp, không có tên người và không có lời kể; chỉ có loại vấn đề và số lần được ghi nhận.',
    privacyTitle: 'Vì sao ở đây không có tên doanh nghiệp',
    privacyBody: 'Nêu tên một doanh nghiệp kèm cáo buộc chưa được kiểm chứng có thể dẫn đến kiện tụng về phỉ báng đối với bên vận hành trang này. Tại những nơi làm việc chỉ có vài người, tên doanh nghiệp còn giúp chủ đoán ra ai đã ghi nhận. Gộp theo ngành và khu vực vẫn cảnh báo được cho người đi xin việc mà không tạo ra hai rủi ro đó.',
    prototypeNote: 'Bản thử nghiệm: ghi nhận bạn thêm chỉ được lưu trên thiết bị này, chưa được gửi đi và không ai khác xem được. Để triển khai chính thức, cần một máy chủ do RMWC quản lý cùng với quy trình kiểm duyệt nội dung của RMWC.',
    searchLabel: 'Tìm theo ngành hoặc khu vực',
    searchPlaceholder: 'Ví dụ: Cabramatta',
    resultsTitle: 'Các ngành và khu vực đã được ghi nhận',
    sampleBadge: 'Dữ liệu mẫu',
    yoursBadge: 'Có báo cáo của bạn',
    reportCount: count => `Đã có ${count} người lao động ghi nhận`,
    onlyOne: 'Hiện chỉ có một ghi nhận, chưa đủ để xác định thành mẫu hình. Vui lòng xem đây là điều nên tìm hiểu kỹ, không phải một kết luận.',
    patternCount: count => `${count} lần`,
    noResults: 'Không tìm thấy ngành hoặc khu vực phù hợp. Việc chưa có ghi nhận không có nghĩa là nơi đó tuân thủ đúng quy định, mà chỉ có nghĩa là chưa ai ghi nhận.',
    emptyBoard: 'Chưa có ghi nhận nào được lưu.',
    addTitle: 'Thêm một ghi nhận',
    addNote: 'Vui lòng chỉ ghi nhận công việc mà bạn từng làm. Không cần tên của bạn, không cần tên doanh nghiệp và không cần ngày cụ thể.',
    industryLabel: 'Ngành',
    industryPlaceholder: 'Chọn ngành',
    industries: { nail_beauty: 'Làm móng / thẩm mỹ', restaurant_cafe: 'Nhà hàng / quán cà phê', fast_food: 'Thức ăn nhanh', grocery_retail: 'Siêu thị / bán lẻ', cleaning: 'Vệ sinh', delivery: 'Giao hàng / tài xế', construction: 'Xây dựng', aged_care: 'Chăm sóc người cao tuổi', other: 'Ngành khác' },
    suburbLabel: 'Khu vực',
    suburbPlaceholder: 'Ví dụ: Bankstown',
    patternsLabel: 'Bạn đã gặp những vấn đề nào?',
    submit: 'Thêm ghi nhận',
    submitted: 'Ghi nhận đã được thêm vào danh sách trên thiết bị này.',
    needIndustry: 'Vui lòng chọn ngành.',
    needSuburb: 'Vui lòng nhập khu vực.',
    needPattern: 'Vui lòng chọn ít nhất một loại vấn đề.',
    rulesTitle: 'Cách hiểu thông tin trong phần này',
    rules: [
      'Đây là những điều người lao động ghi nhận, không phải kết luận đã được kiểm chứng.',
      'Một ngành hoặc khu vực chưa có ghi nhận không vì thế mà được xem là tuân thủ đúng quy định.',
      'Nhiều ghi nhận về cùng một loại vấn đề là dấu hiệu cho thấy bạn nên hỏi kỹ về điều đó trước khi nhận việc.',
      'Đây là thông tin về ngành và khu vực, không phải về một doanh nghiệp cụ thể, nên không kết luận được điều gì về nơi bạn đang làm. Vui lòng liên hệ RMWC để được tư vấn về hoàn cảnh của mình.',
    ],
    clear: 'Xoá những ghi nhận tôi đã thêm',
    back: 'Quay lại',
    months: 'Thời gian ghi nhận',
    flagTitle: 'Ghi nhận vào Cảnh báo cộng đồng',
    flagIntro: 'Bạn có thể để người lao động khác biết những vấn đề thường gặp trong ngành và khu vực của mình. Ghi nhận này không kèm tên doanh nghiệp. Mục này hoàn toàn tự nguyện và mặc định đang tắt.',
    flagCheckbox: 'Thêm ghi nhận này vào Cảnh báo cộng đồng.',
    flagPreviewLabel: 'Nội dung sẽ được thêm, và chỉ có bấy nhiêu',
    flagPrototype: 'Trong bản thử nghiệm này, ghi nhận chỉ được lưu trên thiết bị của bạn và không ai khác xem được. Tên doanh nghiệp, lời kể, tiền lương, loại visa và thông tin liên lạc của bạn không bao giờ được thêm vào.',
    flagAdded: 'Đã thêm vào Cảnh báo cộng đồng trên thiết bị này. Bỏ đánh dấu để xoá.',
    flagNoIndustry: 'Mục này cần ngành và khu vực. Bạn có thể điền ở phần "Bạn làm công việc gì?" trong bộ câu hỏi.',
    flagNoPatterns: 'Mục này cần ít nhất một loại vấn đề bạn đã chọn ở Phần 2 của bộ câu hỏi.',
  },
  en: {
    navLabel: 'Community warnings',
    eyebrow: 'LOGGED BY WORKERS, BY INDUSTRY AND SUBURB',
    title: 'Know what is common in your industry.',
    intro: 'A record where workers may log the patterns they have encountered, aggregated by industry and suburb. No business names, no personal names and no accounts are published: only the type of issue and how often it has been logged.',
    privacyTitle: 'Why no business is named here',
    privacyBody: 'Naming a business alongside an unverified allegation may expose the operator of this record to a defamation claim, and at a workplace of only a few staff the name would also allow the employer to identify who logged the report. Aggregating by industry and suburb still warns a jobseeker without creating either risk.',
    prototypeNote: 'Prototype: any report you add remains on this device only. Nothing has been transmitted and no other person can view it. A production version would require a server under RMWC’s control, together with moderation by RMWC.',
    searchLabel: 'Search by industry or suburb',
    searchPlaceholder: 'For example: Cabramatta',
    resultsTitle: 'Industries and suburbs recorded to date',
    sampleBadge: 'Sample data',
    yoursBadge: 'Includes your report',
    reportCount: count => `Logged by ${count} ${count === 1 ? 'worker' : 'workers'}`,
    onlyOne: 'Only one report has been submitted, which is not sufficient to establish a pattern. Please treat this as a matter to enquire about rather than a conclusion.',
    patternCount: count => `${count}×`,
    noResults: 'No matching industry or suburb was found. The absence of a record does not indicate compliance; it indicates only that nothing has been logged.',
    emptyBoard: 'No records have been logged yet.',
    addTitle: 'Add a report',
    addNote: 'Please log only work you have done yourself. No personal name, no business name and no exact date are required.',
    industryLabel: 'Industry',
    industryPlaceholder: 'Select an industry',
    industries: { nail_beauty: 'Nail and beauty', restaurant_cafe: 'Restaurant or café', fast_food: 'Fast food', grocery_retail: 'Grocery or retail', cleaning: 'Cleaning', delivery: 'Delivery or driving', construction: 'Construction', aged_care: 'Aged care', other: 'Another industry' },
    suburbLabel: 'Suburb',
    suburbPlaceholder: 'For example: Bankstown',
    patternsLabel: 'Which issues did you encounter?',
    submit: 'Add report',
    submitted: 'The report has been added to the record on this device.',
    needIndustry: 'Please select an industry.',
    needSuburb: 'Please enter a suburb.',
    needPattern: 'Please select at least one issue type.',
    rulesTitle: 'How to interpret this record',
    rules: [
      'These entries are matters reported by workers, not verified findings.',
      'An industry or suburb with no entries is not, for that reason, compliant.',
      'Several reports of the same issue indicate that the matter is worth asking about before accepting a role.',
      'These entries concern an industry and a suburb rather than any particular business, so they establish nothing about your own workplace. Please contact RMWC regarding your own circumstances.',
    ],
    clear: 'Delete the reports I have submitted',
    back: 'Back',
    months: 'Periods recorded',
    flagTitle: 'Record this in Community warnings',
    flagIntro: 'You may inform other workers of the issues that arise in your industry and suburb. No business is named in the entry. This is entirely voluntary and is switched off by default.',
    flagCheckbox: 'Add this entry to Community warnings.',
    flagPreviewLabel: 'The entry that would be added, and nothing further',
    flagPrototype: 'In this prototype, the entry is stored on your device only and no other person can view it. Business names, your account, pay details, visa type and contact details are never included.',
    flagAdded: 'Added to Community warnings on this device. Clear the selection to remove it.',
    flagNoIndustry: 'This requires an industry and a suburb. You may provide them in the “What work do you do?” question.',
    flagNoPatterns: 'This requires at least one issue type, as selected in Part 2 of the questionnaire.',
  },
};
