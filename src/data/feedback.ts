import type { Localized } from '../types';

const l = (vi: string, en: string): Localized => ({ vi, en });

/**
 * Plain-language "why this matters" hints for every dialogue choice,
 * keyed by `${residentId}:${choiceId}`. Shown only when the player asks.
 */
export const choiceWhy: Record<string, Localized> = {
  // ——— Linh (underpayment) ———
  'linh:wait': l('Cho chị ấy tự quyết nhịp cho thấy bạn đến để lắng nghe, không phải để hỏi nhanh. Cách này thường mở lời trước.', 'Letting her set the pace shows you came to listen, not to interrogate. It usually earns the first opening.'),
  'linh:long_day': l('Hỏi về ca làm một cách bình tĩnh mở ra chuyện giờ làm mà không nghe như trách móc.', 'A calm question about her day opens the topic of hours without sounding like an accusation.'),
  'linh:push': l('Hỏi kiểu này dễ nghe như trách móc — chị ấy có thể đóng cửa lại.', 'Asked this way it can sound like criticism, and she may close the conversation.'),
  'linh:apologise': l('Nhận lại nhịp và cho chị ấy thời gian có thể hàn chỗ khựng vừa rồi.', 'Owning the misstep and offering time can repair the pause and recover trust.'),
  'linh:leave': l('Để chị ấy nghỉ là tôn trọng, nhưng câu chuyện — và những gì chị ấy có thể giữ lại — kết thúc tối nay.', 'Letting her rest is respectful, but the conversation — and what she could have kept — ends tonight.'),
  'linh:envelope': l('Phong bì không kèm giấy tờ là dấu hiệu đầu tiên: không có phiếu lương, giờ làm và super rất khó kiểm chứng.', 'An envelope with no slip is the first sign: without paperwork, hours and super are hard to prove.'),
  'linh:stay': l('Hiểu điều giữ chị ấy ở lại giúp bạn hỗ trợ lựa chọn của chị ấy, thay vì ép ý mình.', 'Understanding what keeps her here lets you support her choices instead of pushing your own.'),
  'linh:dismiss': l('Lời khuyên quá đơn giản nghe như coi nhẹ rủi ro mà bạn không phải gánh.', 'A solution this simple can sound dismissive of risks you do not share.'),
  'linh:listen': l('Gọi tên cả sự biết ơn lẫn cảm giác bất ổn thường là chìa khóa để chị ấy nói ra nỗi lo thật.', 'Naming that gratitude and unease can coexist is often what lets her voice the real worry.'),
  'linh:proof': l('Lịch làm là bản ghi giờ của chị ấy. Hỏi về nó giữ bằng chứng sống mà không cần đối đầu ai.', 'Rosters are her record of hours. Asking about them keeps evidence alive without confronting anyone.'),
  'linh:report': l('Bảo chị ấy phải làm gì lấy mất quyền quyết định — đúng điều chị ấy đang thiếu ở chỗ làm.', 'Telling her what she must do takes the decision away — the very thing she lacks at work.'),
  'linh:control': l('Gỡ áp lực quanh nỗi lo visa giúp chị ấy giữ cửa mở cho quyết định của chính mình.', 'Easing the pressure around her visa fear keeps the door open for her own decision later.'),
  'linh:pause': l('Đổi chuyện một lát cho thấy bạn tôn trọng cảm xúc của chị ấy; áp lực không tạo ra lòng tin.', 'Changing the subject for a moment shows respect; pressure does not build trust.'),
  'linh:keep': l('Một bản sao lịch làm riêng là bằng chứng chị ấy tìm lại được — thứ khiến câu chuyện kiểm chứng được về sau.', 'A separate copy of the rosters is evidence she can find again — what makes the story provable later.'),
  'linh:leave_choice': l('Để chị ấy quyết giữ niềm tin, nhưng lịch cũ có thể bị ghi đè và mất.', 'Leaving the decision with her keeps her trust, though the old rosters may be overwritten and lost.'),
  'linh:demand': l('Giật lấy điện thoại của chị ấy lặp lại đúng cảm giác mất kiểm soát mà chị ấy đã chịu ở chỗ làm.', 'Taking her phone repeats the loss of control she already lives with at work.'),

  // ——— Bảo (sham contracting) ———
  'bao:sauce': l('Một câu hỏi nhẹ về buổi chạy đơn cho thấy bạn quan tâm tới con người Bảo trước chuyện việc làm.', 'A light question about his run signals you care about Bảo the person before the worker.'),
  'bao:shift': l('Hỏi về ca làm lặng lẽ mở chuyện ai thật sự điều khiển lịch của cậu ấy.', 'A factual question about shifts quietly opens who really controls his roster.'),
  'bao:contract': l('Gọi đúng tên sự sắp đặt công việc là bước đầu để biết "nhà thầu" có phản ánh công việc thật không.', 'Naming the arrangement is the first step to knowing whether "contractor" describes the real work.'),
  'bao:flexible': l('Ai được thay ca, ai chọn tuyến — đây là những câu hỏi đầu tiên một người tư vấn sẽ hỏi.', 'Who can substitute, who picks the routes — these are the first questions an adviser asks.'),
  'bao:judge': l('Đổ lỗi cho chữ ký kết thúc phần lắng nghe; ý của cuộc trò chuyện là điều gì xảy ra sau khi ký.', 'Blaming the signature ends the listening; the point here is what happens after signing.'),
  'bao:hard': l('Gọi tên khuôn mẫu — chi phí của cậu ấy, quyền kiểm soát của công ty — giúp Bảo thấy việc này không đơn thuần là lỗi của mình.', 'Naming the pattern — his costs, their control — helps Bảo see this is not simply his fault.'),
  'bao:boss': l('Hỏi về sự tử tế trong mối quan hệ cho thấy bạn hiểu vì sao khó hành động.', 'Asking about the kindness in the relationship shows you understand why acting is hard.'),
  'bao:sit': l('Gỡ áp lực giúp cậu ấy đối diện mấy lá thư thuế sau này; nỗi sợ một mình không quyết định gì.', 'Easing the pressure helps him face the tax letters later; fear alone decides nothing.'),
  'bao:documents': l('Hợp đồng và tin nhắn điều phối là bằng chứng cho thấy ai thật sự kiểm soát công việc.', 'The contract and the dispatch messages are the evidence of who really controls the work.'),
  'bao:quit': l('Nghỉ việc không đơn giản khi tiền nhà và visa treo vào ca làm tiếp theo.', 'Quitting is not simple when rent and a visa hang on the next shift.'),
  'bao:keep': l('Lưu hợp đồng và một tuần lịch là bước khởi đầu nhỏ, an toàn — bằng chứng đưa ra được thay vì "hình như".', 'Saving the contract and one week of shifts is a small, safe start — evidence he can show instead of "I think".'),
  'bao:space': l('Để quyết định lại cho Bảo giữ được lòng tin, dù giấy tờ còn rải rác.', 'Leaving the choice with Bảo keeps his trust, though the records stay scattered for now.'),

  // ——— Cô Hạnh (workplace injury) ———
  'hanh:tea': l('Nhận lời mời của cô là tôn trọng; câu chuyện bắt đầu theo nhịp của cô.', 'Accepting her offer is respect; the conversation starts on her terms.'),
  'hanh:hand': l('Để ý cánh tay cho thấy bạn quan tâm trước khi hỏi — cô sẽ tự kể chuyện tay khi sẵn lòng.', 'Noticing her arm shows care before questions — she can raise the injury when ready.'),
  'hanh:care': l('Hỏi xem sau đó có ai ở bên cô mở đầu cho chuyện ai đã thấy gì — bước đầu của một bản ghi.', 'Asking who was around afterwards quietly maps who saw what — the beginning of a record.'),
  'hanh:doctor': l('Sức khỏe trước giấy tờ: câu hỏi có được khám chưa quan trọng hơn mọi thủ tục.', 'Health before paperwork: whether she has been seen matters more than any process.'),
  'hanh:blame': l('Đổ lỗi kết thúc câu chuyện; tai nạn khi làm việc là chuyện của nơi làm việc, không phải lỗi của cô.', 'Blame ends the conversation; a workplace injury is a workplace matter, not her fault.'),
  'hanh:stay': l('Hiểu căn bếp nghĩa gì với cô giúp bạn hỗ trợ mà không ép cô phải bỏ đi.', 'Understanding what the kitchen means to her helps you support her without pushing her to leave.'),
  'hanh:record': l('Ai có mặt hôm đó là bằng chứng; trí nhớ phai nhanh hơn tin nhắn.', 'Who was present is evidence; memory fades faster than messages.'),
  'hanh:force': l('Nói thay cô trong cuộc gọi lặp lại cảm giác mất kiểm soát cô vừa trải qua.', 'Speaking for her on the call repeats the loss of control she just experienced.'),
  'hanh:keep': l('Ghi ngày và giữ tin nhắn là bằng chứng sống sót qua trí nhớ phai nhạt.', 'A dated note and the saved message are evidence that outlasts fading memory.'),
  'hanh:rest': l('Để cô nghỉ và tự quyết giữ được lòng tin, dù ngày tháng có thể nhạt dần.', 'Letting her rest keeps her trust, though the dates may blur.'),

  // ——— Trâm (sexual harassment) ———
  'tram:camera': l('Hỏi về niềm vui của Trâm cho thấy bạn nhìn thấy con người cô, không chỉ chuyện đã xảy ra.', 'Asking about her passion shows you see her as a person, not only as what happened.'),
  'tram:quiet': l('Im lặng có khi an toàn hơn câu hỏi; nó nhường cô chọn nhịp.', 'Quiet can be safer than questions; it lets her set the pace.'),
  'tram:listen': l('Nói rõ "kể đến đâu là đủ" trao lại cho cô quyền kiểm soát mà mấy tin nhắn đang lấy mất.', 'Making "only what you want to tell" explicit hands back the control the messages take away.'),
  'tram:doubt': l('Nghi ngờ cảm nhận của cô đóng cánh cửa; chính cảm nhận ấy là tín hiệu quan trọng nhất.', 'Doubting her reading closes the door; her sense of it is the key signal.'),
  'tram:keep': l('Một bản sao riêng giữ lựa chọn mở cho tương lai; cô không bao giờ phải mở nó nếu không muốn.', 'A private copy keeps future options open; she never has to open it unless she chooses.'),
  'tram:control': l('Giữ tối nay thật nhẹ nhàng tôn trọng lời cô nói; bản ghi có thể chờ theo nhịp của cô.', 'Keeping tonight simple respects what she said; the record can wait for her timing.'),
  'tram:force': l('Đối đầu vì cô lấy đi quyết định quan trọng nhất — quyết định đó phải là của cô.', 'Confronting him for her removes the one decision that must stay hers.'),

  // ——— Đức (unfair dismissal) ———
  'duc:patient': l('Không giục anh mở lời giúp Đức kể chuyện lịch làm bằng chính lời của mình.', 'Not rushing him lets Đức raise the roster in his own words.'),
  'duc:busy': l('Đứng chờ cạnh chiếc xe là tôn trọng; câu chuyện có thể theo sau công việc.', 'Standing with the bike is respect; the conversation can follow the work.'),
  'duc:fear': l('Gọi tên sự im lặng dễ trả lời hơn là hỏi anh định làm gì.', 'Naming the silence is easier for him to answer than being asked what he will do.'),
  'duc:blame': l('Nêu mối lo an toàn là việc hợp lý; đổ lỗi biến lo lắng thành "gây chuyện".', 'Raising a safety concern was reasonable; blame turns the worry into "trouble".'),
  'duc:keep': l('Lịch tuần trước và ghi chú ngày tháng là dòng thời gian của sự việc — bằng chứng không gửi lại được.', 'The old roster and a dated note are the timeline of what happened — evidence that cannot be re-sent.'),
  'duc:space': l('Để anh chọn lúc sẵn sàng giữ niềm tin, dù "tạm thời" vẫn chưa có ngày.', 'Leaving the pace with him keeps trust, though "for now" still has no date.'),

  // ——— Khoa (discrimination) ———
  'khoa:listen': l('Một câu bình tĩnh "sau đó thế nào" mời anh kể sự việc mà không bị phán xét.', 'A calm "what happened next" invites the facts without you judging them.'),
  'khoa:dismiss': l('Đồng ý với cái cớ đóng cửa; điều quan trọng là khuôn mẫu, không phải giọng đọc.', 'Agreeing with the excuse closes the door; the pattern matters, not the accent.'),
  'khoa:keep': l('Email cộng ghi chú có ngày cho thấy khuôn mẫu rõ hơn trí nhớ đơn lẻ.', 'The email plus a dated note shows the pattern more clearly than memory alone.'),
  'khoa:pause': l('Gỡ áp lực giữ niềm tin, dù lời nói miệng vẫn chưa được ghi lại.', 'Taking the pressure off keeps trust, though the spoken words stay unrecorded.'),

  // ——— Mai (bullying) ———
  'mai:wait': l('Quan tâm tới chiếc váy cho thấy bạn thấy cả cuộc sống của Mai, không chỉ các ca làm.', 'Caring about the dress shows you see her whole life, not only the shifts.'),
  'mai:listen': l('Một câu hỏi nhẹ nhàng để cô quyết định tối nay chia sẻ được bao nhiêu.', 'A gentle open question lets her decide how much tonight holds.'),
  'mai:hear': l('"Lặp lại" là trọng tâm — khuôn mẫu quan trọng hơn bất kỳ một tin nhắn đơn lẻ.', '"Repeatedly" is the heart of it — the pattern matters more than any single message.'),
  'mai:dismiss': l('Coi đây là áp lực việc làm bình thường xác nhận đúng điều cô cần được nghi ngờ nhất.', 'Treating it as normal work pressure confirms the very thing she most needs doubted.'),
  'mai:keep': l('Bản sao riêng, giữ theo cách của cô, là bằng chứng nằm trong tầm kiểm soát của cô.', 'Her own copies, kept her way, are evidence that stays in her control.'),
  'mai:control': l('Để cô chọn kể với ai giữ niềm tin; những tin còn lại có thể mất.', 'Leaving the telling with her keeps trust; the remaining messages may go.'),
  'mai:takeover': l('Xử lý kiểu "để tôi lo" qua đầu cô có thể đe dọa cả chỗ ở — lựa chọn phải là của cô.', 'Acting over her head can put her housing at risk — the choice must stay hers.'),
};

/** One-line recap of what each story was really about, shown in the debrief. */
export const residentLessons: Record<string, Localized> = {
  linh: l('Câu chuyện này hỏi về lương phong bì tiền mặt: không có phiếu lương, giờ làm và super rất khó kiểm chứng. Một bản sao lịch làm riêng là bằng chứng đầu tiên.', 'This story asks about cash-in-hand pay: without a payslip, hours and super are hard to prove. A private copy of the roster is the first evidence.'),
  bao: l('Câu chuyện này hỏi liệu "nhà thầu" có thật sự tự chủ công việc: ai chia lịch, ai được thay ca, ai gánh chi phí — những câu hỏi đó quyết định bản chất của sự sắp đặt.', 'This story asks whether a "contractor" truly controls his own work: who sets the roster, who may substitute, who carries the costs — those questions decide what the arrangement really is.'),
  hanh: l('Câu chuyện này nói về tai nạn khi làm việc: chăm sóc sức khỏe đến trước, và ghi ngày tháng giữ lại sự việc khi trí nhớ phai và lịch thay đổi.', 'This story is about an injury at work: care comes first, and a dated note protects what happened when memory fades and rosters change.'),
  tram: l('Câu chuyện này nói về quấy rối nơi làm việc: một bản ghi riêng giữ các lựa chọn mở mà không ép bất kỳ quyết định nào, và sự đồng ý dẫn từng bước.', 'This story is about harassment at work: a private record keeps options open without forcing any decision, and consent leads every step.'),
  duc: l('Câu chuyện này nói về ca làm biến mất: một số lựa chọn có thời hạn ngắn, và dòng thời gian có ngày tháng biến "tạm thời" thành thứ có thể hỏi được.', 'This story is about shifts that vanished: some options have short time limits, and a dated timeline turns "for now" into something that can be questioned.'),
  khoa: l('Câu chuyện này nói về việc bị đối xử khác biệt: yêu cầu bằng văn bản cộng ghi chú có ngày cho thấy khuôn mẫu rõ hơn trí nhớ.', 'This story is about being treated differently: the written request plus a dated note shows the pattern more clearly than memory.'),
  mai: l('Câu chuyện này nói về việc bị hạ nhục lặp lại: khuôn mẫu quan trọng hơn từng tin nhắn, và cách liên lạc an toàn đến trước mọi việc khác.', 'This story is about repeated public shaming: the pattern matters more than any single message, and a safe way to be contacted comes before anything else.'),
};
