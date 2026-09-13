import type { Archetype, Choice, Localized, Resident, StoryNode } from '../types';

const l = (vi: string, en: string): Localized => ({ vi, en });
const c = (id: string, vi: string, en: string, next: string, trust = 0, recordEvidence = false): Choice => ({ id, text: l(vi, en), next, trust, recordEvidence });
const n = (id: string, vi: string, en: string, next?: string, choices?: Choice[], kind: StoryNode['kind'] = 'dialogue'): StoryNode => ({ id, text: l(vi, en), next, choices, kind });

export const archetypeLabels: Record<Archetype, Localized> = {
  underpayment: l('Tiền lương và các khoản bị trừ', 'Pay and deductions'),
  sham_contracting: l('Mang tên nhà thầu, làm như nhân viên', 'A contractor in name'),
  workplace_injury: l('Bị thương trong lúc làm việc', 'An injury at work'),
  sexual_harassment: l('Quấy rối tình dục', 'Sexual harassment'),
  unfair_dismissal: l('Mất việc hoặc bị cắt hết ca', 'Losing your job or every shift'),
  discrimination: l('Bị đối xử khác biệt', 'Being treated differently'),
  bullying: l('Bắt nạt tại nơi làm việc', 'Bullying at work'),
};

// General context belongs outside the characters' dialogue. These are prompts
// for a conversation with a qualified adviser, never findings about a visitor.
export const legalNotes: Record<Archetype, Localized> = {
  underpayment: l('Tiền lương, thời gian làm việc và các khoản bị trừ có thể cần được kiểm tra cùng nhau. RMWC có thể giúp bạn tìm hiểu điều gì áp dụng cho công việc của mình; câu chuyện này không xác định bạn được hưởng bao nhiêu.', 'Pay, working time and deductions may need to be reviewed together. RMWC can help you understand what applies to your work; this story does not determine what you are owed.'),
  sham_contracting: l('Có ABN chưa đủ để biết mối quan hệ làm việc thực tế là gì. Hợp đồng và cách công việc được tổ chức đều có thể quan trọng; RMWC có thể xem xét tình huống cụ thể của bạn.', 'An ABN alone does not settle the nature of a working relationship. The contract and how work is organised can both matter; RMWC can look at your particular situation.'),
  workplace_injury: l('Nếu bạn bị thương khi làm việc, chăm sóc sức khỏe là điều cần ưu tiên. Ghi lại điều đã xảy ra, nếu an toàn; RMWC có thể giúp bạn tìm hiểu các lựa chọn hỗ trợ phù hợp.', 'If you are injured at work, getting care matters. If it is safe, make a record of what happened; RMWC can help you understand suitable support options.'),
  sexual_harassment: l('Bạn có thể tìm sự hỗ trợ mà không phải kể lại mọi chi tiết ở đây. RMWC có thể lắng nghe và giải thích các lựa chọn để bạn tự quyết định bước tiếp theo.', 'You can seek support without describing every detail here. RMWC can listen and explain options so you can decide what happens next.'),
  unfair_dismissal: l('Nếu bạn vừa mất việc hoặc bị cắt hết ca, hãy liên hệ RMWC sớm nếu có thể: một số lựa chọn có thời hạn ngắn. Tình huống và điều kiện áp dụng cần được xem xét riêng.', 'If you have just lost your job or all your shifts, contact RMWC promptly if you can: some options have short time limits. Your circumstances and eligibility need individual review.'),
  discrimination: l('Nếu cách bạn bị đối xử có liên quan đến một đặc điểm cá nhân, RMWC có thể giúp bạn tìm hiểu các lựa chọn. Ghi lại điều đã nói và điều đã thay đổi có thể giúp bạn kể lại sự việc.', 'If your treatment relates to a personal characteristic, RMWC can help you understand your options. Recording what was said and what changed may help you explain what happened.'),
  bullying: l('Những hành vi lặp lại và ảnh hưởng của chúng đến bạn đều đáng được lắng nghe. Bạn không cần tự đặt tên pháp lý cho sự việc trước khi tìm hỗ trợ từ RMWC.', 'Repeated behaviour and its effect on you deserve to be heard. You do not need to find a legal label for what happened before asking RMWC for support.'),
};

const linh: Resident = {
  id: 'linh', name: 'Linh', age: 26,
  role: l('Thợ làm móng', 'Nail technician'),
  subtitle: l('Linh dành dụm đón mẹ sang chơi, sau từng tuần làm miệt mài ở tiệm móng.', 'She’s saving for Mum’s first visit, one long week at the salon at a time.'),
  archetype: 'underpayment', image: '/images/linh-v2.webp',
  location: l('John Street · Cabramatta', 'John Street · Cabramatta'),
  intro: l('Bên cửa sổ tiệm móng trên John Street, Linh, 26 tuổi, mơ đến ngày dẫn mẹ đi dạo quanh Cabramatta. Sáu ngày làm gói trong một phong bì tiền mặt, còn tiền nhà và học phí khiến cô khó từ chối những giờ làm thêm.', 'At the nail salon window on John Street, Linh, 26, imagines showing her mum around Cabramatta. Six days of work fit into one cash envelope, while rent and tuition make it hard to turn down extra hours.'),
  start: 'hello',
  nodes: {
    hello: n('hello', 'Mưa gần như dọn sạch con đường. Nửa cái bảng hiệu tiệm móng vẫn nhấp nháy trên cửa kính. “Em chờ chị chút.” Chị nhấc khung cửa lên mới kéo được. “Mưa vậy mà còn đứng ngoài hả?” Một nhịp lặng. “Chị vừa xong bộ cuối. Khách bảo mai đi đám cưới, nên làm kỹ một chút.”', 'The rain has almost emptied the street. Half the salon sign is still flickering above the window. “Give me a second.” She lifts the window before it will slide. “Still out in this rain?” A pause. “I just finished the last set. She has a wedding tomorrow, so we took a little longer.”', undefined, [
      c('wait', 'Không vội. Chị cứ làm xong đi.', 'Take your time. Finish what you need to.', 'mother', 1),
      c('long_day', 'Hôm nay chị làm từ mấy giờ?', 'What time did you start today?', 'hours'),
      c('push', 'Muộn thế này sao chị chưa về?', 'Why haven’t you gone home by now?', 'guarded', -1),
    ]),
    mother: n('mother', 'Chị quay màn hình điện thoại xuống mặt bàn. “Chị đang xem vé máy bay cho mẹ.” Một nhịp lặng. “Mẹ chưa ra khỏi Việt Nam bao giờ. Cứ hỏi bên này có chỗ mua rau muống không.” Chị cười một tiếng nhỏ. “Chị bảo qua đây rồi biết.” Chị nhìn cái điện thoại úp trên bàn. “Mà vé thì chưa bấm.”', 'She turns the phone screen down on the counter. “I was looking at flights for Mum.” A pause. “She has never left Vietnam. She keeps asking if she can buy water spinach here.” A small laugh. “I told her she would see when she came.” She looks at the phone lying face down. “I haven’t booked anything yet.”', 'hours'),
    guarded: n('guarded', 'Chị không trả lời ngay. “Khách còn thì mình còn.” Chị nhìn về phía tiệm tối phía sau. “Chị cũng muốn về chứ. Cơm trong nồi chắc khô rồi.” Mưa to hơn. “Thôi. Chuyện trong tiệm nói ra cũng dài.”', 'She doesn’t answer straight away. “While there are customers, we stay.” She looks toward the dark salon behind her. “Of course I want to go home. The rice has probably dried out in the cooker.” The rain gets louder. “Anyway. It’s a long story.”', undefined, [
      c('apologise', 'Xin lỗi chị. Em có thời gian nghe.', 'Sorry. I have time to listen.', 'hours', 1),
      c('leave', 'Vâng, em để chị nghỉ.', 'I’ll let you rest.', 'closed'),
    ]),
    hours: n('hours', 'Bên trong, Linh đếm tiền. Một lần. Hai lần. Rồi lần thứ ba. Chị dừng lại. Vẫn chỉ có tám trăm. “Sáu ngày.” Một nhịp lặng. “Tám trăm đô.” “Sáng chín giờ chị có mặt.” Chị nhìn về phía mấy cái bàn còn ướt. “Xong khi khách cuối về.” Một tiếng cười. Không hẳn là cười. “Nên... em tính thử coi bao nhiêu giờ.”', 'Inside, Linh counts the money. Once. Twice. Then a third time. She stops. There is still only $800. “Six days.” A pause. “Eight hundred dollars.” “Started at nine.” She looks toward the tables still wet from wiping. “Finished when the last customer left.” A small laugh. It isn’t really a laugh. “So... you tell me how many hours that is.”', undefined, [
      c('envelope', 'Trong phong bì còn tờ giấy nào không?', 'Is there a slip in the envelope?', 'envelope', 1),
      c('stay', 'Điều gì làm chị chưa muốn nghỉ?', 'What makes it hard to leave?', 'staying', 1),
      c('dismiss', 'Vậy thì nghỉ đi, có gì đâu.', 'Just leave, then. It’s simple.', 'closed', -2),
    ]),
    envelope: n('envelope', 'Chị lắc đầu. Chị lật phong bì. Một phong bì trắng. Bút bi xanh: “Linh — 800”. Không có số giờ. Chị lật lại. Không có dòng super. Ngón tay chị đè lên cái góc bị ướt. Chỉ có tên chị. Và tám trăm.', 'She shakes her head. She turns the envelope over. A white envelope. In blue pen: “Linh — 800”. No hours. She turns it back. No super. Her thumb presses against the wet corner. Just her name. And eight hundred.', 'deductions', undefined, 'artifact'),
    deductions: n('deductions', 'Chị gấp tiền lại, cất phong bì vào túi. “Có tuần chị làm hỏng màu thì bị trừ tiền chai sơn.” Một nhịp lặng. “Tuần trước chị hỏi tiền Chủ nhật có khác không.” “Anh bảo gộp hết rồi. Đừng tính lẻ.” Chị nhìn ra cửa. “Chị cũng ngại hỏi tiếp. Tuần đầu mới qua, người ta trả tiền nhà giúp mình mà.”', 'She folds the notes back into the envelope and puts it away. “Some weeks, if I spoil a colour, the bottle comes out of my pay.” A pause. “Last week I asked whether Sunday was different.” “He said everything was already included. Don’t count the small things.” She looks toward the door. “I felt awkward asking again. When I first arrived, he helped with the first week’s rent.”', 'staying'),
    staying: n('staying', '“Nhưng đó không phải cái chị lo nhất.” Chị nhìn về phía cửa tiệm. “Anh chủ không phải lúc nào cũng khó. Tết anh lì xì. Mẹ chị bệnh, anh cho đổi ca liền.” Một nhịp lặng. “Nhưng tiền phòng tháng nào cũng đến. Học phí cũng vậy.” “Chị mà nghỉ thì đâu có chỗ mới chờ sẵn.”', '“But that’s not actually the part I’m worried about.” She looks toward the salon door. “He isn’t difficult all the time. He gives us red envelopes at Tết. When Mum was ill he changed my shifts straight away.” A pause. “But rent comes every month. Tuition too.” “If I leave, there isn’t another job waiting.”', undefined, [
      c('listen', 'Ừ. Vừa biết ơn, vừa thấy có điều không ổn.', 'You can be grateful and still feel something is wrong.', 'visa', 1),
      c('proof', 'Chị còn giữ lịch làm không?', 'Do you still have your rosters?', 'roster', 1),
      c('report', 'Chị phải tố cáo anh ấy ngay.', 'You have to report him immediately.', 'closed', -2),
    ]),
    visa: n('visa', '“Chị còn đi học. Visa năm trăm.” Điện thoại trong túi chị rung. Chị không lấy ra. “Có bữa anh nhắn ở lại thêm.” Một nhịp lặng. “Nếu chị hỏi anh chuyện tiền...” Chị dừng lại. “...thì tuần sau còn ca không?”', '“I’m still studying. On a 500 visa.” The phone in her pocket vibrates. She doesn’t take it out. “Sometimes he messages asking me to stay longer.” A pause. “If I ask him about the money...” She stops. “...what happens to next week’s shifts?”', undefined, [
      c('control', 'Chị chưa cần quyết định gì tối nay.', 'You don’t have to decide anything tonight.', 'roster', 1),
      c('pause', 'Mình nói chuyện khác một chút nhé.', 'We can talk about something else for a moment.', 'colour', 1),
    ]),
    colour: n('colour', 'Chị mở ngăn kéo. Một chai sơn đỏ nhỏ, để riêng một góc. “Mẹ chị thích màu đỏ.” Chị cười. “Lần nào chị gửi ảnh móng mới, mẹ cũng bảo dài thế làm sao vo gạo.” Một nhịp lặng. “Chai này chị mua cho mẹ. Không phải đồ của tiệm.”', 'She opens the drawer. A small bottle of red polish, kept apart from the rest. “Mum likes red.” She smiles. “Every time I send her a nail photo, she asks how anyone could wash rice with nails that long.” A pause. “This one is hers. Not the salon’s.”', 'roster'),
    roster: n('roster', 'Chị mở nhóm chat ra. “Lịch nằm trong đây. Anh sửa hoài.” Chị cuộn lên. “Hôm trước chị nhìn lại...” Chị dừng lại. “...ca tối thứ Sáu biến mất rồi.” Điện thoại đầy ảnh móng. “Chị đang tính xóa mấy cái screenshot cũ cho nhẹ máy.”', 'She opens the group chat. “The roster lives in here. He keeps changing it.” She scrolls back. “I looked back the other day...” She stops. “...and my Friday evening had disappeared.” The phone is full of nail photos. “I was going to delete the old screenshots to make space.”', undefined, [
      c('keep', 'Nếu chị thấy an toàn, giữ riêng ảnh lịch cũ đã.', 'If it feels safe, keep a separate copy of the old rosters.', 'kept', 1, true),
      c('leave_choice', 'Chuyện đó chị quyết định. Em vẫn nghe đây.', 'That is your choice. I’m still here.', 'unkept', 1),
      c('demand', 'Đưa điện thoại đây, em gửi hết cho người ta.', 'Give me your phone. I’ll send everything for you.', 'closed', -2),
    ]),
    kept: n('kept', 'Chị nghĩ một lúc. “Chị có email riêng. Trong tiệm không ai biết mật khẩu.” Chị bắt đầu lưu ảnh. “Lưu mấy cái này trước đã.” Một nhịp lặng. “Rồi viết thêm những hôm ở lại dọn.” “Chưa gửi ai đâu. Chỉ để mai không phải cố nhớ lại.”', 'She thinks for a moment. “I have my own email. Nobody at work knows the password.” She starts saving the images. “I’ll save these first.” A pause. “Then note the nights I stayed to clean.” “I’m not sending them to anyone yet. Just so I don’t have to remember everything tomorrow.”', 'goodbye'),
    unkept: n('unkept', 'Chị cất điện thoại vào túi. “Ừ.” Một nhịp lặng. “Hôm nay đầu chị nhiều thứ quá.” “Cái lịch cũ chắc còn đâu đó.” Chị nhìn xuống chân. “Giờ chị chỉ muốn về tháo giày ra thôi.”', 'She puts the phone back in her pocket. “Yes.” A pause. “My head is full tonight.” “The old roster is probably somewhere.” She looks down at her feet. “Right now I just want to go home and take my shoes off.”', 'goodbye'),
    goodbye: n('goodbye', 'Chị tắt nửa cái bảng hiệu còn nhấp nháy. “Cảm ơn em đã đứng nghe.” Một nhịp lặng. “Chị cứ tưởng kể ra người ta sẽ bảo tại mình chịu thôi.” Chị lấy điện thoại ra. “Để chị gọi mẹ trước khi bên đó đi ngủ.” “Chuyện vé máy bay... chắc chưa nói tối nay.”', 'She switches off the half-flickering sign. “Thanks for staying.” A pause. “I thought people would just say I put up with it, so it was my fault.” She takes out her phone. “I’ll call Mum before she goes to bed.” “The flights... probably not tonight.”', 'reflection'),
    closed: n('closed', 'Chị lùi vào phía trong. “Thôi em, chị còn phải đóng tiệm.” Một nhịp lặng. “Có nhiều thứ chị chưa kể. Để bữa khác.” Cánh cửa kéo xuống một nửa. “Em về cẩn thận. Ngoài đó trơn.”', 'She steps back inside. “I still have to close up.” A pause. “There are things I haven’t told you. Maybe another day.” The window slides half down. “Get home safely. It’s slippery out there.”', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Linh giữ lại ảnh lịch làm và ghi những giờ dọn tiệm. Khi cô quyết định tìm hỗ trợ, các mốc thời gian giúp làm rõ câu chuyện; trong nhánh này, cô nhận lại một phần tiền và đặt vé cho mẹ. Kết quả ngoài đời tùy từng tình huống.', 'Fictional ending: Linh keeps her roster screenshots and notes the cleaning hours. When she chooses to seek support, the dates help tell her story; in this branch she recovers some pay and books Mum’s flight. Real outcomes depend on individual circumstances.'),
    missed: l('Đoạn kết hư cấu: Lịch chat bị ghi đè, những ảnh cũ không còn. Linh rời tiệm mà chưa lấy lại được tiền; việc dựng lại giờ làm trở nên khó hơn. Thiếu giấy tờ không có nghĩa là ngoài đời bạn không thể tìm hỗ trợ.', 'Fictional ending: The chat roster is overwritten and the old images are gone. Linh leaves without recovering her pay; reconstructing the hours becomes harder. Missing records do not mean you cannot seek support in real life.'),
  },
};

const bao: Resident = {
  id: 'bao', name: 'Bảo', age: 23,
  role: l('Người giao hàng', 'Delivery rider'),
  subtitle: l('Bảo mới ra trường, dành dụm mua xe riêng nhưng chưa được tự chọn ca làm.', 'A graduate saving for a car of his own, with little say over his next shift.'),
  archetype: 'sham_contracting', image: '/images/bao-v2.webp',
  location: l('Freedom Plaza · Cabramatta', 'Freedom Plaza · Cabramatta'),
  intro: l('Bảo, 23 tuổi, tựa bên cửa sổ căn hộ trên quán ăn gần Freedom Plaza, mơ một chuyến ra biển bằng chiếc xe của mình. Công việc giao hàng giúp trả tiền nhà, nhưng công ty phân tuyến và cắt ca khi cậu từ chối làm.', 'Bảo, 23, leans by his flat’s window above a takeaway near Freedom Plaza, dreaming of a coastal drive in his own car. Deliveries pay the rent, but the company assigns his routes and cuts shifts when he says no.'),
  start: 'hello',
  nodes: {
    hello: n('hello', 'Đứng nép vào dưới mái nhé, nước chảy đúng chỗ đó. Em vừa về sau cuốc cuối, đồ ăn thì khô mà người ướt hết. Nhà hàng quên bỏ nước chấm, khách gọi em ba lần như thể em đang giấu nó trong túi.', 'Stay under the awning; it drips right where you’re standing. I’ve just got home from the last delivery. The food stayed dry, but I didn’t. The restaurant forgot the sauce, and the customer called me three times as if I had hidden it.', undefined, [
      c('sauce', 'Rồi cuối cùng có tìm được nước chấm không?', 'Did the sauce ever turn up?', 'car', 1),
      c('shift', 'Hôm nay còn phải chạy nữa không?', 'Do you still have more work tonight?', 'roster'),
    ]),
    car: n('car', 'Không, em mua chai khác ở cửa hàng tiện lợi luôn. Em đang để dành mua cái xe cũ, khỏi thuê ba trăm một tuần nữa; chiếc xe đạp này để chạy mấy cuốc gần thôi. Có xe của mình chắc trời mưa sẽ đỡ ghét cái nghề này hơn một chút.', 'No. I bought a bottle at the convenience store. I’m saving for a used car so I can stop paying three hundred a week to rent one; this bike is for the short runs. Maybe rain wouldn’t make me hate the job so much if the car were mine.', 'roster'),
    roster: n('roster', 'Công ty giao hàng gửi lịch tối Chủ nhật. Em muốn đổi ca phải xin trước, chạy tuyến nào cũng họ chia. Tuần rồi em từ chối một tối để dự lễ tốt nghiệp của bạn, tuần này mất hai ca.', 'The delivery company sends the roster on Sunday night. I have to ask to change it, and they assign the routes. Last week I turned down an evening for a friend’s graduation. This week two shifts disappeared.', undefined, [
      c('contract', 'Họ gọi công việc này là gì?', 'What do they call this arrangement?', 'abn', 1),
      c('flexible', 'Em có tự chọn khách hay người chạy thay không?', 'Can you choose customers or send someone in your place?', 'substitute', 1),
      c('judge', 'Em ký rồi thì chịu thôi.', 'You signed it. That’s on you.', 'closed', -2),
    ]),
    abn: n('abn', 'Ngày đầu họ bảo mở ABN rồi mới nhận việc, làm nhanh lắm. Em tưởng giấy đó giống số hồ sơ nhân viên. Đến lúc họ bảo em tự lo thuế với bảo hiểm, em mới thấy có nhiều thứ mình chưa hiểu.', 'On the first day they said I needed an ABN before I could start. It was quick. I thought it was like an employee number. Then they said tax and insurance were mine to handle, and I realised how much I hadn’t understood.', 'paper'),
    paper: n('paper', 'Trên màn hình là tin nhắn: “Mai 5 giờ có mặt. Đồng phục công ty. Không được tự nhờ người thay.” Bên dưới, một tệp PDF ghi tên Bảo và số ABN của cậu, với tiêu đề “Independent contractor”.', 'A message reads: “Be here at 5 tomorrow. Company uniform. No substitutes without approval.” Below it, a PDF carries Bảo’s name and ABN under the heading “Independent contractor”.', 'substitute', undefined, 'artifact'),
    substitute: n('substitute', 'Có lần em sốt, nhờ bạn chạy hộ mà họ không cho. Nhưng xe hỏng, xăng tăng, hay khách không chịu xuống lấy thì em tự chịu. Anh điều phối gọi em là “đối tác”, rồi nhắn hỏi sao nghỉ giữa ca lâu thế.', 'Once I had a fever and asked if a friend could cover; they said no. But if the vehicle breaks down, petrol goes up or a customer won’t come downstairs, that’s mine to deal with. The dispatcher calls me a “partner”, then messages to ask why my break is so long.', undefined, [
      c('hard', 'Nghe như em phải gánh cả hai phía.', 'It sounds like you carry the costs on both sides.', 'tax', 1),
      c('boss', 'Người điều phối có lúc nào giúp em không?', 'Does the dispatcher ever help you out?', 'boss', 1),
    ]),
    boss: n('boss', 'Có chứ. Hôm xe chết máy, anh ấy đến đón, còn cho mượn tiền thay bình. Em vẫn nhớ chuyện đó. Nên mỗi lần muốn hỏi cái khoản họ trừ, em lại sợ nghe như mình vô ơn.', 'Yes. When the car died, he picked me up and lent me money for the battery. I remember that. So every time I want to ask about a deduction, I worry it sounds ungrateful.', 'tax'),
    tax: n('tax', 'Em ra trường rồi, visa bốn tám năm. Mẹ nghĩ tốt nghiệp là ổn định rồi, còn em chưa mở mấy lá thư thuế. Em sợ mình nợ một khoản không trả nổi, nên cứ nghĩ chạy thêm vài tuần rồi tính.', 'I’ve graduated, on a 485 visa. Mum thinks graduating means things have settled down. I haven’t opened some of the tax letters. I’m scared I owe more than I can pay, so I keep telling myself: a few more weeks of deliveries, then I’ll sort it out.', undefined, [
      c('sit', 'Mình có thể ngồi đây một lát. Không cần giải quyết hết.', 'We can sit for a moment. You don’t have to fix everything.', 'dream', 1),
      c('documents', 'Em còn giữ hợp đồng và tin nhắn không?', 'Do you still have the contract and messages?', 'records', 1),
      c('quit', 'Cứ nghỉ là hết vấn đề.', 'Just quit and the problem goes away.', 'closed', -2),
    ]),
    dream: n('dream', 'Em xem một chiếc Corolla màu bạc mấy tháng rồi. Không cần xe đẹp, chỉ cần bật điều hòa không có tiếng như máy xay. Nếu mua được, chuyến đầu em muốn chạy lên biển, điện thoại để im, không có cái túi đồ ăn phía sau.', 'I’ve had my eye on a silver Corolla for months. Nothing fancy, just air conditioning that doesn’t sound like a blender. If I get it, the first trip will be to the coast, phone silent, no food bag in the back.', 'records'),
    records: n('records', 'Hợp đồng em tải được, còn lịch và tiền bị trừ thì mỗi chỗ một ít. Mấy tin nhắn cũ cứ trôi mất giữa cả trăm đơn hàng. Em nhìn vào thấy rối, không biết bắt đầu từ đâu.', 'I can download the contract, but the shifts and deductions are scattered around. Old messages get buried under hundreds of orders. When I look at it all, I don’t know where to start.', undefined, [
      c('keep', 'Nếu an toàn, giữ hợp đồng và một tuần lịch trước đã.', 'If it is safe, save the contract and one week of shifts first.', 'kept', 1, true),
      c('space', 'Tối nay em có thể nghỉ. Chuyện đó để em tự chọn.', 'You can rest tonight. That choice stays with you.', 'unkept', 1),
    ]),
    kept: n('kept', 'Một tuần thì được. Em lưu vào máy riêng, cả tin nhắn họ bảo không được nhờ người thay nữa. Để lúc nói chuyện với ai, em mở ra được chứ không chỉ nói “hình như”.', 'One week I can do. I’ll keep it on my own device, including the message about not sending a substitute. Then if I talk to someone, I can show it instead of saying “I think”.', 'goodbye'),
    unkept: n('unkept', 'Ừ, để mai em xem. Pin còn bốn phần trăm, về tới nhà rồi mà em chưa buồn cắm sạc. Có những hôm việc nhỏ vậy cũng thấy như thêm một cuốc giao hàng nữa.', 'Tomorrow, maybe. Four per cent battery, and I’ve got home without even putting it on charge. Some days even a small thing feels like one more delivery.', 'goodbye'),
    goodbye: n('goodbye', 'Cảm ơn đã không bảo em phải làm gì ngay. Em tắt nhận đơn rồi, thật đấy. Giờ đi mua tô cháo trước khi người ta dọn, hôm nay em mới ăn có cái bánh lúc trưa.', 'Thanks for not telling me I have to do something right away. I’ve stopped taking orders. Really. I’m going to get some congee before they close; all I’ve had today is a roll at lunch.', 'reflection'),
    closed: n('closed', 'Ừ, chắc em tự tính được. Em còn một đơn phải xem lại. Để bữa khác nói chuyện nhé.', 'Right. I’ll work it out. There’s an order I need to check. Maybe we’ll talk another time.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Bảo giữ hợp đồng, lịch và tin nhắn. Cậu mang chúng tới một cuộc hẹn, kể rõ ai quyết định công việc và bắt đầu tìm hiểu khoản thuế mình lo. Chiếc xe bạc vẫn là một dự định; giờ cậu không phải đoán một mình.', 'Fictional ending: Bảo saves the contract, shifts and messages. He brings them to an appointment, explains who controls the work and starts finding out about the tax he fears. The silver car is still a plan, but he is no longer guessing alone.'),
    missed: l('Đoạn kết hư cấu: Bảo mất quyền xem lịch sau khi đổi việc. Cậu vẫn tìm được người lắng nghe, nhưng phải ghép lại nhiều tuần từ trí nhớ. Câu chuyện chưa kết thúc; không có đủ giấy tờ không phải là hết lựa chọn.', 'Fictional ending: Bảo loses access to the roster after changing jobs. Someone still listens, but he has to piece weeks together from memory. His story is unfinished; missing documents do not mean there are no options.'),
  },
};

const hanh: Resident = {
  id: 'hanh', name: 'Cô Hạnh', age: 54,
  role: l('Phụ bếp', 'Kitchen hand'),
  subtitle: l('Cô Hạnh mong hai mẹ con có một ngày đi biển sau kỳ thi HSC.', 'She wants a day by the sea with her daughter after the HSC exams.'),
  archetype: 'workplace_injury', image: '/images/hanh-v2.webp',
  location: l('Arthur Street · Cabramatta', 'Arthur Street · Cabramatta'),
  intro: l('Bên cửa sổ bếp nhà trên Arthur Street, cô Hạnh, 54 tuổi, pha trà và mong con gái sớm thi xong để hai mẹ con đi chơi một ngày. Cánh tay phải đau sau một lần trượt ngã trong bếp nhà hàng khiến cô khó làm việc, nhưng ở tuổi này, rời căn bếp quen thuộc để tìm chỗ mới không dễ.', 'At her home kitchen window on Arthur Street, Cô Hạnh, 54, makes tea and looks forward to a day out with her daughter after exams. A slip in the restaurant kitchen has left her right arm hurting, but at her age, leaving a familiar kitchen to find another job feels daunting.'),
  start: 'hello',
  nodes: {
    hello: n('hello', 'Con đứng đó coi chừng cái chậu, nó mẻ góc rồi. Cô trồng húng quế mà mưa hoài, cây cao ngồng, chẳng được mấy lá. Uống trà không? Cô vừa pha, để nguội chút mới cầm được.', 'Mind that pot; the corner is chipped. I planted basil, but with all this rain it grows tall and hardly gives me leaves. Would you like tea? I’ve just made it. Let it cool before you hold it.', undefined, [
      c('tea', 'Dạ, con đứng đây với cô một lát.', 'I’d like to stay a moment.', 'daughter', 1),
      c('hand', 'Để con chờ, cô không cần nhấc ấm đâu.', 'I can wait. You don’t need to lift the kettle.', 'arm', 1),
    ]),
    daughter: n('daughter', 'Con gái cô đang học trong phòng kia. Tháng Mười thi HSC, nó dán giấy ghi nhớ lên cả tủ lạnh, cô mở lấy nước cũng thấy công thức. Cô chỉ mong nó thi xong rồi hai mẹ con đi đâu một ngày, không phải nhìn đồng hồ.', 'My daughter is studying in that room. Her HSC exams are in October. She has revision notes on the fridge; I see formulas every time I get water. After her exams, I want us to go somewhere for a day without watching the clock.', 'arm'),
    arm: n('arm', 'Cái tay này tuần trước trượt lúc bê nồi. Nước dưới sàn, cô bước một cái là cả người chúi xuống; lúc đó còn lo nồi canh đổ hơn lo tay. Đến tối cởi áo mới biết không giơ lên nổi.', 'This arm slipped last week while I was lifting a pot. Water on the floor, one step and I went forward. At the time I worried more about spilling the soup. That night I couldn’t raise my arm to take my shirt off.', undefined, [
      c('care', 'Sau đó có ai ở với cô không?', 'Was anyone there with you afterwards?', 'after', 1),
      c('doctor', 'Cô đã có dịp gặp bác sĩ chưa?', 'Have you had a chance to see a doctor?', 'doctor', 1),
      c('blame', 'Cô phải cẩn thận hơn chứ.', 'You should have been more careful.', 'closed', -2),
    ]),
    after: n('after', 'Anh chủ đưa cô về, trời hôm đó cũng mưa. Anh mua dầu xoa, bảo nghỉ một hôm rồi đỡ; cô nghe cũng muốn tin. Nhưng hôm sau cô cầm cái lược còn đau, làm sao bưng nguyên rổ chén.', 'The owner drove me home. It was raining that day too. He bought liniment and said a day off would do it. I wanted to believe him. The next day it hurt to hold a comb; how was I going to carry a whole rack of dishes?', 'doctor'),
    doctor: n('doctor', 'Con gái đặt hẹn cho cô rồi. Cô cứ định hủy, sợ tốn tiền, sợ phải nghỉ thêm, mà nó nói để con lo cái hẹn, mẹ chỉ việc đi. Cô chưa kể hết chuyện trong bếp cho nó nghe, sợ nó bỏ học ngồi lo.', 'My daughter made an appointment. I kept thinking of cancelling: the cost, more time away. She said, “Let me handle the booking. You just go.” I haven’t told her everything about the kitchen. I don’t want her sitting there worrying instead of studying.', 'message'),
    message: n('message', 'Tin nhắn gửi lúc 7:12 sáng: “Chị cứ nói đau tay ở nhà. Làm giấy tờ phiền lắm, để anh lo.” Ảnh lịch tuần kế tiếp chỉ còn hai ca, thay vì năm. Cô Hạnh chưa trả lời tin nhắn.', 'A message sent at 7:12 am: “Just say your arm started hurting at home. Paperwork is a hassle; I’ll handle it.” Next week’s roster shows two shifts instead of five. Cô Hạnh has not replied.', 'hours', undefined, 'artifact'),
    hours: n('hours', 'Anh nói ít khách nên bớt ca. Cô không biết có phải vì tay mình không, chỉ thấy tiền tuần sau chắc thiếu. Tiền sách ôn thi của con đã đóng rồi, còn hóa đơn điện cô để dưới cái chậu kia, chưa mở.', 'He says there are fewer customers, so there are fewer shifts. I don’t know if it’s my arm; I only know next week’s money will be short. The revision books are paid for. The electricity bill is under that pot, unopened.', undefined, [
      c('stay', 'Cô có muốn kể vì sao công việc này quan trọng không?', 'Would you like to tell me what this job means to you?', 'staying', 1),
      c('record', 'Cô còn nhớ hôm đó có ai trong bếp không?', 'Do you remember who was in the kitchen that day?', 'witness', 1),
      c('force', 'Cô phải gọi anh ấy ngay bây giờ.', 'You need to call him right now.', 'closed', -2),
    ]),
    staying: n('staying', 'Cô năm mươi tư rồi. Tiếng Anh nói chậm, đi xin chỗ khác người ta nhìn tuổi trước hay nhìn tay trước, cô cũng không biết. Ở đây cô thuộc từng cái ngăn kéo, biết ai ăn chay, ai dị ứng; rời đi không phải chỉ bỏ cái bếp.', 'I’m fifty-four. My English is slow. At another place, would they look at my age first or my arm? Here I know every drawer, who is vegetarian, who has allergies. Leaving would mean more than leaving a kitchen.', 'daughter_again'),
    daughter_again: n('daughter_again', 'Hồi mới qua theo chồng, cô cứ nghĩ vài năm nữa sẽ bớt lo. Giờ con lớn sắp bằng cô rồi, vẫn bảo mẹ đừng đứng suốt ngày nữa. Nó muốn làm kỹ sư, còn cô thì chưa phân biệt được mấy cái môn nó học.', 'When I first came here to join my husband, I thought a few years would make things easier. Now my daughter is nearly my height and tells me to stop standing all day. She wants to be an engineer. I can hardly tell her subjects apart.', 'witness'),
    witness: n('witness', 'Có chị rửa chén thấy, còn một cậu mang rau tới nữa. Cô nhớ hôm đó thứ Tư vì vừa bỏ rác tái chế sáng sớm. Cứ sợ vài tuần nữa người ta hỏi lại, cô lẫn ngày rồi thành ra nói không đúng.', 'The woman washing dishes saw it, and a young man delivering vegetables. It was Wednesday; I remember putting out the recycling that morning. I’m afraid that in a few weeks I’ll mix up the dates and sound as if I’m not telling it properly.', undefined, [
      c('keep', 'Nếu cô muốn, ghi ngày và giữ tin nhắn ngay lúc còn nhớ.', 'If you want, note the date and keep the message while it’s fresh.', 'kept', 1, true),
      c('rest', 'Cô nghỉ tay đã. Không cần quyết định với con.', 'Rest your arm first. You don’t need to decide with me.', 'unkept', 1),
    ]),
    kept: n('kept', 'Cô lấy cuốn sổ này ghi được. Ngày, cái nồi nào, ai đứng cạnh; còn tin nhắn thì cô nhờ con chỉ cách lưu riêng khi nó nghỉ học. Cô sẽ đi cái hẹn đã đặt, kể đúng chuyện mình nhớ.', 'I can use this notebook. The date, which pot, who was beside me. I’ll ask my daughter how to save the message separately when she takes a study break. I’ll go to the appointment and explain what I remember.', 'goodbye'),
    unkept: n('unkept', 'Ừ, tối nay cô nghỉ đã. Có cái hẹn với bác sĩ thì cô vẫn đi. Chuyện trong bếp, để cô nghĩ xem mình muốn nói với ai.', 'Tonight I’ll rest. I’ll still go to the doctor’s appointment. As for the kitchen, let me think about who I want to speak with.', 'goodbye'),
    goodbye: n('goodbye', 'Trà nguội rồi, con cầm cẩn thận. Cô đi hâm cháo cho con bé, hâm thôi chứ không bưng nồi to nữa. Mai cô thử cắt bớt cây húng quế; biết đâu nó chịu ra lá.', 'The tea has cooled; hold it carefully. I’m going to warm some congee for my daughter. Just warm it, no big pots. Tomorrow I might trim the basil. Maybe that will persuade it to grow some leaves.', 'reflection'),
    closed: n('closed', 'Thôi con, cô cũng mệt rồi. Con bé còn học, cô không muốn nó nghe mình nói lớn. Để cô đóng cửa cho bớt gió.', 'I’m tired now. My daughter is studying and I don’t want her hearing us raise our voices. I’ll close the window against the draught.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Cô Hạnh đi khám, giữ tin nhắn và ghi lại ngày xảy ra sự việc. Cô mang những gì có tới buổi hỏi thông tin, cùng con gái nếu cô muốn. Mùa thi đến, hai mẹ con vẫn dành một chiều đi biển; việc hỗ trợ tiếp theo tùy tình huống.', 'Fictional ending: Cô Hạnh sees a doctor, keeps the message and notes the date. She brings what she has to an information appointment, with her daughter if she chooses. They still find an afternoon at the coast during exam season; any further support depends on her circumstances.'),
    missed: l('Đoạn kết hư cấu: Cô Hạnh đi khám nhưng chưa ghi lại chuyện trong bếp. Khi muốn kể sau này, cô phải hỏi lại ngày và người có mặt. Cô vẫn có thể tìm hỗ trợ; không nhớ được mọi chi tiết không phải lỗi của cô.', 'Fictional ending: Cô Hạnh sees a doctor but does not yet record what happened in the kitchen. Later she has to check the date and who was there. She can still seek support; not remembering every detail is not her fault.'),
  },
};

const tram: Resident = {
  id: 'tram', name: 'Trâm', age: 20,
  role: l('Nhân viên phục vụ', 'Waitress'),
  subtitle: l('Trâm vừa học vừa phục vụ bàn, dành dụm mua máy ảnh để chụp khu phố.', 'Between study and restaurant shifts, she’s saving for a camera and a little freedom.'),
  archetype: 'sexual_harassment', image: '/images/tram-v2.webp',
  location: l('Hughes Street · Cabramatta', 'Hughes Street · Cabramatta'),
  intro: l('Từ cửa sổ căn hộ thuê trên tầng ở Hughes Street, Trâm, 20 tuổi, ngắm những bảng hiệu cô muốn chụp bằng chiếc máy ảnh đang dành dụm mua. Tin nhắn của quản lý theo cô về tận nhà, còn chuyện học và căn phòng được đồng nghiệp giới thiệu khiến việc nghỉ làm không đơn giản.', 'From her upstairs rental window on Hughes Street, Trâm, 20, watches the signs she hopes to photograph with a camera of her own. Her manager’s messages follow her home, while study costs and a room found through a colleague make leaving the restaurant complicated.'),
  warning: l('Câu chuyện này đề cập đến những lời nói, tin nhắn mang tính tình dục không mong muốn và việc bị chạm vào người. Không có miêu tả trực diện. Bạn có thể bỏ qua hoặc rời đi bất cứ lúc nào.', 'This story mentions unwanted sexual comments, messages and touching, without graphic detail. You can skip it or leave at any time.'),
  start: 'hello',
  nodes: {
    hello: n('hello', 'Em vừa về, còn chưa cất tạp dề nữa. Em đang để dành mua máy ảnh cũ, định chụp mấy bảng hiệu trên đường này lúc mưa. Mà ca tối xong chỉ muốn nằm thôi.', 'I’ve just got home and haven’t even put my apron away. I’m saving for a used camera to photograph the signs on this street in the rain. After an evening shift, though, I only want to lie down.', undefined, [
      c('camera', 'Em thích chụp những bảng hiệu nào?', 'Which signs would you photograph?', 'messages', 1),
      c('quiet', 'Mình đứng yên một lát cũng được.', 'We can just be quiet for a moment.', 'messages', 1),
    ]),
    messages: n('messages', 'Cái bảng màu xanh đầu đường. Em có gửi ảnh vào nhóm nhân viên một lần, rồi người quản lý bắt đầu nhắn riêng, toàn chuyện không phải công việc. Em không trả lời thì hôm sau anh ấy đứng sát hỏi sao làm cao.', 'The blue one at the corner. I shared a photo in the staff group once, and then the manager started messaging me privately about things that weren’t work. If I don’t reply, the next day he stands close and asks why I’m acting so stuck-up.', undefined, [
      c('listen', 'Em chỉ kể đến chỗ em muốn thôi.', 'You only need to tell me what you want to.', 'staying', 1),
      c('doubt', 'Chắc anh ấy chỉ đùa thôi?', 'Maybe he is only joking?', 'closed', -2),
    ]),
    staying: n('staying', 'Có lần anh ấy đặt tay lên eo lúc em đang lấy ly. Em né, anh cười bảo đừng nhạy cảm; ngày khác anh lại đổi ca giúp em đi thi, nên em cứ tự hỏi mình có nghĩ quá không. Em mới hai mươi, còn học, căn phòng đang thuê cũng do chị cùng tiệm giới thiệu.', 'Once he put his hand on my waist while I was getting glasses. I moved away; he laughed and told me not to be sensitive. Another day he changed my shift for an exam, and I kept wondering if I was making too much of it. I’m twenty, still studying. Even my room came through someone at work.', 'records'),
    records: n('records', 'Em cứ muốn xóa mấy tin nhắn cho khỏi nhìn thấy. Chị làm cùng có thấy một lần, nhưng em chưa hỏi chị có nhớ không. Em chưa muốn ai gọi vào tiệm, chỉ muốn ngủ một đêm mà không giật mình khi điện thoại sáng.', 'I want to delete the messages so I don’t have to see them. A woman I work with saw something once, but I haven’t asked if she remembers. I don’t want anyone calling the restaurant. I just want one night without flinching when the phone lights up.', undefined, [
      c('keep', 'Nếu an toàn, em có thể giữ một bản ở nơi riêng tư rồi ẩn cuộc chat.', 'If safe, you could keep a private copy and hide the chat.', 'kept', 1, true),
      c('control', 'Mình không cần làm gì thêm tối nay.', 'We don’t need to do anything more tonight.', 'goodbye', 1),
      c('force', 'Phải gọi anh ta ra nói ngay.', 'We need to confront him right now.', 'closed', -2),
    ]),
    kept: n('kept', 'Em có một chỗ lưu riêng, không dùng máy của tiệm. Để em làm lúc thấy yên tâm. Cảm ơn vì không bắt em mở lại từng tin nhắn ở đây.', 'I have somewhere private, away from the work computer. I’ll do it when I feel comfortable. Thanks for not making me open every message here.', 'goodbye'),
    goodbye: n('goodbye', 'Tối nay em gọi bạn sang ngồi cùng, chỉ vậy thôi. Cái máy ảnh em vẫn sẽ mua, em không muốn mọi thứ mình kể đều là chuyện ở tiệm. Đèn xanh kia đẹp nhất lúc vừa tạnh mưa.', 'Tonight I’ll ask a friend to come over and keep me company. That’s enough. I’m still buying the camera; I don’t want everything I talk about to be about work. That blue light looks best just after the rain stops.', 'reflection'),
    closed: n('closed', 'Thôi, em không muốn kể nữa. Em cần được yên một chút. Chúc anh chị về an toàn.', 'I don’t want to say any more. I need some quiet. Get home safely.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Trâm giữ một bản tin nhắn riêng và chọn nói chuyện với người cô tin. Cô quyết định mình muốn chia sẻ đến đâu. Việc ghi lại không buộc cô phải khiếu nại và không bảo đảm một kết quả.', 'Fictional ending: Trâm keeps a private copy of the messages and chooses someone she trusts to speak with. She decides how much to share. Keeping a record does not commit her to a complaint or guarantee an outcome.'),
    missed: l('Đoạn kết hư cấu: Trâm chưa giữ tin nhắn. Cô vẫn gọi bạn sang ngồi cùng và vẫn có thể tìm người hỗ trợ khi sẵn sàng. Trách nhiệm về hành vi đó không nằm ở cô.', 'Fictional ending: Trâm has not kept the messages. She still calls a friend to keep her company and can still seek support when ready. She is not responsible for the behaviour.'),
  },
};

const duc: Resident = {
  id: 'duc', name: 'Đức', age: 41,
  role: l('Nhân viên kho', 'Warehouse storeman'),
  subtitle: l('Đức sửa xe đạp mừng sinh nhật con, vừa ngóng một lịch làm mãi chưa tới.', 'He’s fixing his son’s birthday bicycle while waiting for a roster that never arrives.'),
  archetype: 'unfair_dismissal', image: '/images/duc-v2.webp',
  location: l('Căn hộ gạch tầng trệt · Canley Vale', 'Ground-floor brick flat · Canley Vale'),
  intro: l('Sau ô cửa căn hộ gạch tầng trệt ở Canley Vale, Đức, 41 tuổi, đang lắp chuông xe đạp để kịp sinh nhật con trai. Tên anh biến mất khỏi lịch làm kho sau khi anh hỏi về chiếc xe nâng rỉ dầu, trong khi tiền nhà và chuyện học của con vẫn cần được lo.', 'Behind the window of his ground-floor brick flat in Canley Vale, Đức, 41, is fitting a bicycle bell in time for his son’s birthday. His warehouse shifts vanished after he asked about a leaking forklift, while rent and his son’s schooling still need to be paid for.'),
  needsReturn: true, start: 'hello',
  nodes: {
    hello: n('hello', 'Nãy anh chưa muốn mở, không phải tại em. Anh đang sửa cái xe đạp nhỏ, sinh nhật thằng bé tuần sau; nó chỉ thích cái chuông, đạp thì vẫn cần bố giữ. Em có nói chuyện với mấy người ngoài kia rồi hả?', 'I wasn’t ready to open earlier. It wasn’t you. I’m fixing a little bike; my boy’s birthday is next week. He mostly likes the bell. I still have to hold him up when he pedals. You’ve spoken with some of the others out there?', undefined, [
      c('patient', 'Vâng. Anh muốn kể thì em nghe.', 'Yes. I’ll listen if you want to talk.', 'roster', 1),
      c('busy', 'Em có thể chờ anh sửa xe xong.', 'I can wait while you finish the bike.', 'roster', 1),
    ]),
    roster: n('roster', 'Thứ Hai anh mở lịch, tên không còn nữa. Anh gọi, bên công ty thuê người bảo kho không cần anh, còn quản lý kho bảo hỏi công ty. Đồng phục anh vẫn giữ, chưa ai nói rõ anh còn việc hay đã hết.', 'On Monday I opened the roster and my name was gone. The labour-hire company said the warehouse didn’t need me; the warehouse manager told me to ask the agency. I still have my uniform. Nobody has clearly said whether I still have a job.', 'before'),
    before: n('before', 'Tuần trước anh có hỏi cái xe nâng rỉ dầu, không dám chạy tiếp. Quản lý nói để xem, chiều đó vẫn cho anh đi sớm đón con như mọi bữa. Rồi im luôn; anh cứ nhìn điện thoại, nghĩ chắc lịch chưa cập nhật.', 'Last week I asked about a forklift leaking oil; I didn’t want to keep driving it. The manager said he’d look into it. That afternoon he still let me leave early to collect my son, as usual. Then silence. I keep checking the phone, thinking the roster hasn’t updated yet.', undefined, [
      c('fear', 'Sự im lặng đó chắc khó chịu lắm.', 'That silence sounds hard to live with.', 'staying', 1),
      c('blame', 'Lẽ ra anh đừng gây chuyện.', 'You shouldn’t have made trouble.', 'closed', -2),
    ]),
    staying: n('staying', 'Anh qua theo diện bốn tám hai, nhiều thứ gắn với công việc này. Chưa biết chính xác tình hình mà anh đã nghĩ đến tiền thuê nhà, rồi chuyện trường của con. Anh chưa cần ai quyết định hộ, chỉ muốn biết mình đang đứng ở đâu.', 'I came on a 482 visa. A lot feels tied to this job. I don’t even know exactly what has happened, and I’m already thinking about rent and my son’s school. I don’t need anyone to decide for me. I want to know where I stand.', 'records'),
    records: n('records', 'Anh còn cái lịch tuần trước và tin nhắn hỏi về xe nâng. Cuộc gọi sáng nay thì không ghi gì, giờ chỉ nhớ họ bảo “tạm thời”. Anh không biết tạm thời là đến ngày nào.', 'I still have last week’s roster and the message about the forklift. I didn’t note this morning’s call; all I remember is “for now”. I don’t know what date “for now” is supposed to end.', undefined, [
      c('keep', 'Nếu an toàn, anh giữ lại lịch và ghi ngày cuộc gọi nhé.', 'If safe, keep the roster and note when the call happened.', 'kept', 1, true),
      c('space', 'Anh có thể chọn bước tiếp theo khi sẵn sàng.', 'You can choose your next step when you are ready.', 'goodbye', 1),
    ]),
    kept: n('kept', 'Ừ, anh ghi những gì nhớ được, chỗ nào không chắc thì để là không chắc. Xong rồi anh sẽ tìm người hỏi sớm, cứ chờ cái điện thoại này không giúp mình rõ hơn. Nhưng trước hết lắp xong cái chuông đã.', 'I’ll write what I remember and mark the parts I’m unsure of. Then I’ll find someone to ask soon; staring at this phone isn’t making anything clearer. First, though, I’ll finish fitting the bell.', 'goodbye'),
    goodbye: n('goodbye', 'Nghe thử cái chuông này đi. To quá phải không? Thằng bé sẽ thích lắm, hàng xóm chắc không. Cảm ơn em đã quay lại.', 'Listen to this bell. Too loud, isn’t it? My boy will love it. The neighbours probably won’t. Thanks for coming back.', 'reflection'),
    closed: n('closed', 'Anh biết rồi. Anh còn cái xe đang tháo dở. Để anh làm nốt nhé.', 'I hear you. I have a bike in pieces here. I’d like to finish it.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Đức ghi lại ngày bị mất ca và mang lịch, tin nhắn tới một cuộc hỏi thông tin sớm. Anh chưa có câu trả lời cuối cùng, nhưng câu chuyện có mốc thời gian rõ hơn. Không có kết quả pháp lý nào được bảo đảm.', 'Fictional ending: Đức records when his shifts vanished and brings the roster and messages to an early advice conversation. He has no final answer yet, but a clearer timeline. No legal outcome is guaranteed.'),
    missed: l('Đoạn kết hư cấu: Đức tiếp tục chờ lịch mới. Khi muốn tìm hiểu, anh cần dựng lại ngày và các cuộc gọi. Nếu bạn vừa mất việc, một số lựa chọn có thời hạn ngắn; RMWC có thể giúp tìm hiểu sớm.', 'Fictional ending: Đức keeps waiting for a new roster. When he seeks information, he must reconstruct dates and calls. If you have recently lost a job, some options have short time limits; RMWC can help you look into them promptly.'),
  },
};

const khoa: Resident = {
  id: 'khoa', name: 'Khoa', age: 33,
  role: l('Nhân viên chăm sóc người cao tuổi', 'Aged care worker'),
  subtitle: l('Khoa hiểu từng người mình chăm sóc và mong có cơ hội học làm trưởng ca.', 'He knows his residents by heart and wants the chance to lead their care team.'),
  archetype: 'discrimination', image: '/images/khoa-v2.webp',
  location: l('Hiên nhà có chậu chanh · Lansvale', 'Lemon-tree veranda · Lansvale'),
  intro: l('Dưới mái hiên nhà ở Lansvale, Khoa, 33 tuổi, tưới chậu chanh và nhẩm lời bài hát cho buổi diễn của nhóm hợp xướng khu phố. Anh muốn học làm trưởng ca ở nơi chăm sóc người cao tuổi, nhưng bị chê giọng nói dù vẫn gắn bó với những người mình đã chăm sóc nhiều năm.', 'Under his home’s veranda in Lansvale, Khoa, 33, waters a lemon tree and rehearses for the community choir. He wants team-leader training at the aged care home, but criticism of his accent holds him back, and he is reluctant to leave the people who count on his care.'),
  start: 'hello',
  nodes: {
    hello: n('hello', 'Mưa không tới được cái chậu này, nên vẫn phải tưới. Anh đang trồng cho ra đúng một trái thôi, để chứng minh với vợ là không phải cây cảnh. Cuối tuần anh còn tập hát, nhóm khu phố thiếu giọng nam mà ai cũng bắt anh đứng sau.', 'The rain never reaches this pot, so I still have to water it. I want one lemon, just to prove to my wife it isn’t ornamental. I sing on weekends too. The community choir needs men, but somehow they still put me at the back.', 'work'),
    work: n('work', 'Ở chỗ làm anh chăm mấy cụ lâu rồi, nhiều người nhớ tên anh hơn tên con cháu. Nhưng lúc xin học ca trưởng, quản lý bảo giọng anh nghe chưa “chuyên nghiệp”. Người mới vào sau anh thì được đi học, còn anh lại được nhờ chỉ việc cho bạn ấy.', 'I’ve cared for some residents for years. A few remember my name more easily than their grandchildren’s. When I asked about team-leader training, the manager said my accent wasn’t “professional” enough. Someone who started after me got the training, and I was asked to show them the work.', undefined, [
      c('listen', 'Anh đã làm gì sau khi nghe vậy?', 'What happened after they said that?', 'staying', 1),
      c('dismiss', 'Chắc do anh nói tiếng Anh chưa tốt thôi.', 'Maybe your English just isn’t good enough.', 'closed', -2),
    ]),
    staying: n('staying', 'Anh về tập nói cái câu bàn giao cả chục lần, rồi thấy mình kỳ. Anh có thường trú rồi, nhưng không phải vì vậy mà muốn bỏ những người mình chăm. Quản lý cũng có hôm rất tử tế, cho đổi ca khi vợ anh ốm; thành ra anh chẳng biết mở đầu câu hỏi đó thế nào.', 'I went home and practised the handover sentence a dozen times, then felt strange about doing it. I’m a permanent resident, but that doesn’t mean I want to walk away from the people I care for. The manager can be kind; they changed my shifts when my wife was ill. I don’t know how to begin that conversation.', 'records'),
    records: n('records', 'Email xin học anh còn giữ, câu trả lời thì nói miệng ở phòng nghỉ. Có chị ngồi đó nghe được. Anh chỉ nhớ từ “chuyên nghiệp”, mấy chữ trước sau cứ nghĩ đi nghĩ lại rồi rối cả lên.', 'I kept the email asking about training. The answer was spoken in the break room, and a colleague was there. I remember “professional”. I’ve replayed the rest so often that the words around it are getting muddled.', undefined, [
      c('keep', 'Nếu muốn, anh ghi điều mình nhớ và giữ email riêng.', 'If you want, note what you remember and keep the email privately.', 'kept', 1, true),
      c('pause', 'Anh không cần chứng minh điều gì với em lúc này.', 'You don’t need to prove anything to me now.', 'goodbye', 1),
    ]),
    kept: n('kept', 'Anh sẽ ghi cả ngày lẫn ai có mặt, còn câu nào không nhớ nguyên văn thì nói rõ. Anh cũng muốn hỏi tiêu chí khóa học bằng email, để biết mình cần gì chứ không tự đoán mãi. Chắc làm từng việc nhỏ vậy trước.', 'I’ll note the date and who was there, and say where I don’t remember the exact words. I also want to ask for the training criteria by email so I’m not guessing what they want. Small steps first.', 'goodbye'),
    goodbye: n('goodbye', 'Thôi để anh đem chậu vào sát tường, gió bắt đầu mạnh rồi. Chủ nhật nhóm hát có diễn miễn phí ở hội trường, anh phải nhớ lời cho xong. Ít nhất ở đó anh được hát bằng giọng của mình.', 'I’ll move the pot closer to the wall; the wind is picking up. The choir has a free performance at the hall on Sunday. I need to learn the words. At least there I get to sing in my own voice.', 'reflection'),
    closed: n('closed', 'Ừ. Anh nghe câu đó rồi. Anh phải chuẩn bị đồ cho ca sáng, chúc em ngủ ngon.', 'Yes. I’ve heard that before. I need to get ready for the morning shift. Good night.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Khoa giữ email và ghi lại cuộc nói chuyện. Anh chọn một cuộc hẹn để hỏi về cách mình bị đối xử, rồi vẫn đi tập hát tối Chủ nhật. Việc lưu thông tin giúp anh kể rõ hơn; không quyết định kết quả.', 'Fictional ending: Khoa keeps the email and notes the conversation. He chooses an appointment to discuss his treatment, and still makes Sunday choir practice. The records help him explain; they do not determine the outcome.'),
    missed: l('Đoạn kết hư cấu: Khoa chưa ghi lại cuộc nói chuyện. Anh tiếp tục suy nghĩ về điều mình muốn hỏi; ký ức và người chứng kiến vẫn có thể là điểm bắt đầu cho một cuộc trao đổi hỗ trợ.', 'Fictional ending: Khoa has not recorded the conversation. He keeps thinking about what he wants to ask; his memory and someone who was there may still be a starting point for seeking support.'),
  },
};

const mai: Resident = {
  id: 'mai', name: 'Mai', age: 29,
  role: l('Nhân viên vệ sinh', 'Commercial cleaner'),
  subtitle: l('Mai may váy sinh nhật cho cháu, cố để tiếng điện thoại không làm mình giật thót.', 'She’s sewing a birthday dress for her niece, trying to quiet the phone beside her.'),
  archetype: 'bullying', image: '/images/mai-v2.webp',
  location: l('Railway Parade · Cabramatta', 'Railway Parade · Cabramatta'),
  intro: l('Trong căn phòng thuê cuối dãy nhà thấp tầng trên Railway Parade, Mai, 29 tuổi, may thêm chiếc túi đựng đá vào váy sinh nhật của cháu gái. Những tin nhắn trách mắng lặp lại khiến cô lo trước mỗi ca vệ sinh, nhưng tiền nhà vẫn phải trả và chỗ ở cũng do người trong công ty giới thiệu.', 'In her room at the end of a low-rise rental block on Railway Parade, Mai, 29, sews a stone-collecting pocket into her niece’s birthday dress. Repeated messages shaming her make each cleaning shift harder to face, but rent is due and someone at the company helped her find this room.'),
  warning: l('Câu chuyện này có lời kể về việc bị hạ nhục lặp lại, đe dọa mất ca và lo lắng trước giờ làm. Bạn có thể bỏ qua hoặc rời đi bất cứ lúc nào mà không mất quyền tìm hỗ trợ.', 'This story describes repeated humiliation, threats of losing shifts and anxiety before work. You can skip or leave at any time and still access support.'),
  needsReturn: true, start: 'hello',
  nodes: {
    hello: n('hello', 'Xin lỗi, lúc nãy em đang nghe điện thoại, không muốn mở cửa. Em sửa cái váy cho cháu, đường chỉ cứ xiên vì máy này cũ quá. Sinh nhật nó tháng sau, em hứa có cái túi thật để bỏ đá vào, nó thích nhặt đá hơn thích búp bê.', 'Sorry I didn’t open earlier. I was on the phone and didn’t want to. I’m fixing a dress for my niece. The machine is old and the seams keep wandering. Her birthday is next month; I promised her a real pocket for stones. She likes collecting stones more than dolls.', undefined, [
      c('wait', 'Cái túi đó quan trọng mà. Em cứ may tiếp.', 'That pocket matters. Take your time.', 'work', 1),
      c('listen', 'Em muốn nói chuyện một chút không?', 'Would you like to talk for a while?', 'work', 1),
    ]),
    work: n('work', 'Quản lý gửi ảnh sàn vào nhóm, khoanh đỏ rồi ghi tên em, gần như ca nào cũng vậy. Có hôm đó không phải khu em dọn. Em giải thích thì cả nhóm nhận tin nhắn thoại bảo ai không chịu nổi cứ nghỉ, ngoài kia thiếu gì người.', 'The supervisor posts floor photos in the group, circles things in red and writes my name. Almost every shift. Sometimes it isn’t even my area. If I explain, everyone gets a voice message saying anyone who can’t handle it should leave; there are plenty of replacements.', undefined, [
      c('hear', 'Việc đó lặp lại khiến em thấy thế nào?', 'What has it been like having that happen repeatedly?', 'staying', 1),
      c('dismiss', 'Đi làm thì phải chịu áp lực thôi.', 'Work is stressful. You have to take it.', 'closed', -2),
    ]),
    staying: n('staying', 'Trước mỗi ca điện thoại rung là em đau bụng. Em đang chờ giấy tờ, visa bắc cầu, tiền phòng thì không chờ; chỗ ở cũng có người trong công ty giới thiệu. Có hôm quản lý cho em đi nhờ xe, hỏi thăm cháu rất bình thường, rồi hôm sau lại mắng trước cả nhóm.', 'Before a shift, a buzzing phone makes my stomach hurt. I’m waiting on paperwork, on a bridging visa, but rent doesn’t wait. Someone at the company helped me find this room too. Some days the supervisor gives me a lift and asks about my niece, then the next day shames me in front of everyone.', 'records'),
    records: n('records', 'Em hay xóa tin nhắn thoại sau khi nghe, không muốn mở máy ra thấy nữa. Chị làm ca bên cạnh có hỏi em ổn không, mà em chỉ bảo mệt. Em sợ kể ra rồi người ta gọi về chỗ làm trước khi em kịp nghĩ.', 'I often delete the voice messages after listening because I don’t want to see them on the phone again. A woman on the next shift asked if I was all right, and I said I was tired. I’m afraid if I tell someone they’ll call work before I’ve had time to think.', undefined, [
      c('keep', 'Nếu an toàn, em có thể giữ bản riêng và ghi ngày, theo cách em chọn.', 'If safe, you could keep private copies and dates in a way you choose.', 'kept', 1, true),
      c('control', 'Em được chọn mình kể với ai và kể đến đâu.', 'You can choose who you tell and how much you share.', 'goodbye', 1),
      c('takeover', 'Đưa số đây, để tôi xử lý quản lý đó.', 'Give me the number. I’ll deal with that supervisor.', 'closed', -2),
    ]),
    kept: n('kept', 'Em có máy riêng, công ty không dùng được. Em sẽ giữ mấy tin còn lại, ghi chuyện nào ở ca nào; chỗ nào chưa nhớ thì để trống. Rồi em muốn hỏi người ta trước cách liên lạc nào kín, chứ đừng gọi lúc em đang làm.', 'I have my own device that the company can’t access. I’ll save what is left and note which shift each thing happened on; I can leave gaps where I’m unsure. Before anything else, I want to ask about a private way to stay in touch. No calls while I’m working.', 'goodbye'),
    goodbye: n('goodbye', 'Cái túi xong rồi này, đủ to cho một nắm đá. Em tắt thông báo một lát để may nốt gấu váy. Cảm ơn đã quay lại mà không làm như em nợ một câu trả lời.', 'The pocket is finished. Big enough for a handful of stones. I’ll silence the notifications for a while and finish the hem. Thanks for coming back without acting as though I owed you an answer.', 'reflection'),
    closed: n('closed', 'Em không muốn nói tiếp nữa. Em cần tự chọn chuyện này, được không? Em đóng cửa đây.', 'I don’t want to keep talking. I need to choose what happens with this. I’m closing the window now.', 'closed'),
  },
  epilogue: {
    kept: l('Đoạn kết hư cấu: Mai giữ lại những tin còn có và ghi chú trên thiết bị riêng. Cô chọn cách liên lạc an toàn trước khi chia sẻ câu chuyện. Chiếc váy được gửi đi đúng sinh nhật; bước tiếp theo vẫn do cô quyết định.', 'Fictional ending: Mai saves the remaining messages and notes on her own device. She chooses a safe contact method before sharing her story. The dress arrives for the birthday. What happens next remains her decision.'),
    missed: l('Đoạn kết hư cấu: Mai chưa giữ các tin nhắn. Cô hoàn thành chiếc váy và nghĩ tới việc nói với người mình tin. Chưa có giấy tờ hoặc chưa sẵn sàng kể hết không làm mất quyền tìm hỗ trợ.', 'Fictional ending: Mai has not saved the messages. She finishes the dress and considers speaking with someone she trusts. Having no documents, or not being ready to tell everything, does not prevent seeking support.'),
  },
};

export const residents: Resident[] = [linh, bao, hanh, tram, duc, khoa, mai];
