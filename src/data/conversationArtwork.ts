import type { Resident } from '../types';

export type StoryStage = 'dialogue' | 'reflection' | 'artifact' | 'deepening' | 'epilogue';
export type Ending = 'kept' | 'missed';
type Artwork = { nodes: Record<string, string>; endings: Record<Ending, string> };

/** Each conversation beat has its own authored shot; hello uses the established portrait. */
export const conversationArtwork: Record<string, Artwork> = {
  "linh": {
    "nodes": {
      "hello": "/images/linh-v2.webp",
      "mother": "/images/conversations/linh/mother.webp",
      "guarded": "/images/conversations/linh/guarded.webp",
      "hours": "/images/conversations/linh/hours.webp",
      "envelope": "/images/conversations/linh/envelope.webp",
      "deductions": "/images/conversations/linh/deductions.webp",
      "staying": "/images/conversations/linh/staying.webp",
      "visa": "/images/conversations/linh/visa.webp",
      "colour": "/images/conversations/linh/colour.webp",
      "roster": "/images/conversations/linh/roster.webp",
      "kept": "/images/conversations/linh/kept.webp",
      "unkept": "/images/conversations/linh/unkept.webp",
      "goodbye": "/images/conversations/linh/goodbye.webp",
      "closed": "/images/conversations/linh/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/linh/ending-kept.webp",
      "missed": "/images/conversations/linh/ending-missed.webp"
    }
  },
  "bao": {
    "nodes": {
      "hello": "/images/bao-v2.webp",
      "car": "/images/conversations/bao/car.webp",
      "roster": "/images/conversations/bao/roster.webp",
      "abn": "/images/conversations/bao/abn.webp",
      "paper": "/images/conversations/bao/paper.webp",
      "substitute": "/images/conversations/bao/substitute.webp",
      "boss": "/images/conversations/bao/boss.webp",
      "tax": "/images/conversations/bao/tax.webp",
      "dream": "/images/conversations/bao/dream.webp",
      "records": "/images/conversations/bao/records.webp",
      "kept": "/images/conversations/bao/kept.webp",
      "unkept": "/images/conversations/bao/unkept.webp",
      "goodbye": "/images/conversations/bao/goodbye.webp",
      "closed": "/images/conversations/bao/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/bao/ending-kept.webp",
      "missed": "/images/conversations/bao/ending-missed.webp"
    }
  },
  "hanh": {
    "nodes": {
      "hello": "/images/hanh-v2.webp",
      "daughter": "/images/conversations/hanh/daughter.webp",
      "arm": "/images/conversations/hanh/arm.webp",
      "after": "/images/conversations/hanh/after.webp",
      "doctor": "/images/conversations/hanh/doctor.webp",
      "message": "/images/conversations/hanh/message.webp",
      "hours": "/images/conversations/hanh/hours.webp",
      "staying": "/images/conversations/hanh/staying.webp",
      "daughter_again": "/images/conversations/hanh/daughter_again.webp",
      "witness": "/images/conversations/hanh/witness.webp",
      "kept": "/images/conversations/hanh/kept.webp",
      "unkept": "/images/conversations/hanh/unkept.webp",
      "goodbye": "/images/conversations/hanh/goodbye.webp",
      "closed": "/images/conversations/hanh/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/hanh/ending-kept.webp",
      "missed": "/images/conversations/hanh/ending-missed.webp"
    }
  },
  "tram": {
    "nodes": {
      "hello": "/images/tram-v2.webp",
      "messages": "/images/conversations/tram/messages.webp",
      "staying": "/images/conversations/tram/staying.webp",
      "records": "/images/conversations/tram/records.webp",
      "kept": "/images/conversations/tram/kept.webp",
      "goodbye": "/images/conversations/tram/goodbye.webp",
      "closed": "/images/conversations/tram/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/tram/ending-kept.webp",
      "missed": "/images/conversations/tram/ending-missed.webp"
    }
  },
  "duc": {
    "nodes": {
      "hello": "/images/duc-v2.webp",
      "roster": "/images/conversations/duc/roster.webp",
      "before": "/images/conversations/duc/before.webp",
      "staying": "/images/conversations/duc/staying.webp",
      "records": "/images/conversations/duc/records.webp",
      "kept": "/images/conversations/duc/kept.webp",
      "goodbye": "/images/conversations/duc/goodbye.webp",
      "closed": "/images/conversations/duc/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/duc/ending-kept.webp",
      "missed": "/images/conversations/duc/ending-missed.webp"
    }
  },
  "khoa": {
    "nodes": {
      "hello": "/images/khoa-v2.webp",
      "work": "/images/conversations/khoa/work.webp",
      "staying": "/images/conversations/khoa/staying.webp",
      "records": "/images/conversations/khoa/records.webp",
      "kept": "/images/conversations/khoa/kept.webp",
      "goodbye": "/images/conversations/khoa/goodbye.webp",
      "closed": "/images/conversations/khoa/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/khoa/ending-kept.webp",
      "missed": "/images/conversations/khoa/ending-missed.webp"
    }
  },
  "mai": {
    "nodes": {
      "hello": "/images/mai-v2.webp",
      "work": "/images/conversations/mai/work.webp",
      "staying": "/images/conversations/mai/staying.webp",
      "records": "/images/conversations/mai/records.webp",
      "kept": "/images/conversations/mai/kept.webp",
      "goodbye": "/images/conversations/mai/goodbye.webp",
      "closed": "/images/conversations/mai/closed.webp"
    },
    "endings": {
      "kept": "/images/conversations/mai/ending-kept.webp",
      "missed": "/images/conversations/mai/ending-missed.webp"
    }
  }
};

export function conversationImage(resident: Resident, nodeId: string, stage: StoryStage, ending: Ending): string {
  const artwork = conversationArtwork[resident.id];
  if (stage === 'epilogue') return artwork?.endings[ending] ?? resident.image;
  // Reflection and private notes retain the last spoken scene, so the focus stays on the visitor.
  return artwork?.nodes[nodeId] ?? resident.image;
}

export function nextConversationImages(resident: Resident, nodeId: string, ending: Ending): string[] {
  const node = resident.nodes[nodeId];
  if (!node) return [];
  if (!node.choices?.length && (!node.next || node.next === 'reflection' || node.next === 'closed')) {
    const finalImage = conversationArtwork[resident.id]?.endings[node.next === 'closed' ? 'missed' : ending];
    return finalImage ? [finalImage] : [];
  }
  const nextIds = node.choices?.map(choice => choice.next) ?? (node.next ? [node.next] : []);
  return [...new Set(nextIds.map(id => conversationArtwork[resident.id]?.nodes[id]).filter((src): src is string => !!src))];
}
