export class DestinationSnapshot {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly phone: string,
  ) {
    if (!name || name.length > 100) throw new Error('届け先名は1〜100文字でなければなりません');
    if (!address || address.length > 255) throw new Error('届け先住所は1〜255文字でなければなりません');
    if (!phone || phone.length > 20) throw new Error('届け先電話番号は1〜20文字でなければなりません');
  }
}
