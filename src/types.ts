export interface EbookMetadata {
  niche: string;
  tone: string;
  pages: number;
  author: string;
}

export interface EbookChapterData {
  title: string;
  content: string;
}

export interface EbookData {
  metadata: EbookMetadata;
  title: string;
  chapters: EbookChapterData[];
}
