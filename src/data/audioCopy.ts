import type { Language, Localized } from '../types';

export const audioCopy = {
  vi: {
    autoplay: 'Tự động đọc lời thoại', voiceVolume: 'Âm lượng lời thoại', rainVolume: 'Âm lượng mưa',
    adaptive: 'Mưa thay đổi theo cuộc trò chuyện',
    deviceVoice: 'Dùng giọng đọc của thiết bị khi chưa có bản thu',
    deviceReading: 'Đang đọc bằng giọng tự động của thiết bị',
    missing: 'Lời thoại này chưa có bản thu giọng người. Bạn vẫn có thể đọc và tiếp tục.',
    blocked: 'Nhấn Nghe lời thoại để bật âm thanh.', error: 'Không tải hoặc phát được lời thoại. Nhấn Nghe lời thoại để thử lại.',
    loading: 'Đang chuẩn bị âm thanh…', replay: 'Nghe lại từ đầu',
    rainError: 'Không tải được tiếng mưa. Tắt rồi bật lại để thử lại.',
    rainBlocked: 'Trình duyệt đã chặn tiếng mưa. Tắt rồi bật lại âm thanh mưa để thử lại.',
    note: 'Lời thoại tự phát khi bạn chuyển đoạn. Nếu bạn bật tùy chọn, thiết bị có thể đọc những câu chưa có bản thu. Mưa nhỏ lại khi nhân vật nói. Trên iPhone, hãy tăng âm lượng và tắt chế độ im lặng nếu không nghe thấy.',
  },
  en: {
    autoplay: 'Auto-play dialogue', voiceVolume: 'Voice volume', rainVolume: 'Rain volume',
    adaptive: 'Rain responds to the conversation',
    deviceVoice: 'Use the device voice when there is no recording',
    deviceReading: 'Read by your device’s built-in voice',
    missing: 'This line has no human recording yet. You can still read and continue.',
    blocked: 'Press Listen to this line to enable audio.', error: 'This line could not load or play. Press Listen to this line to retry.',
    loading: 'Preparing audio…', replay: 'Replay from the start',
    rainError: 'Rain could not load. Switch it off and on to retry.',
    rainBlocked: 'The browser blocked rain playback. Switch rain off and on to retry.',
    note: 'Dialogue plays when you move to a new line. If you switch it on, your device’s voice can read lines that have no recording yet. Rain softens while a character speaks. On an iPhone, turn the volume up and silent mode off if you hear nothing.',
  },
};

/** Keyed by the language of the line, and always shown in both languages. */
export const noVoiceCopy: Record<Language, Localized> = {
  vi: {
    vi: 'Thiết bị này chưa có giọng đọc tiếng Việt, nên lời thoại chỉ hiển thị dạng chữ. Bạn có thể thêm giọng đọc trong cài đặt của thiết bị.',
    en: 'This device has no Vietnamese voice, so this line is text only. You can add a voice in your device settings.',
  },
  en: {
    vi: 'Thiết bị này chưa có giọng đọc tiếng Anh, nên lời thoại chỉ hiển thị dạng chữ. Bạn có thể thêm giọng đọc trong cài đặt của thiết bị.',
    en: 'This device has no English voice, so this line is text only. You can add a voice in your device settings.',
  },
};
