export interface Card {
  id: number
  name: string
  imageUrl: string
  flipped: boolean
  matched: boolean
}

export interface ImageMap {
  [key: string]: string
}

