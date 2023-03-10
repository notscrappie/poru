import { Player } from "./Player";

export class Filters {
  public player: Player;
  public volume: number;
  public equalizer: Band[];
  public vibrato: vibratoOptions;
  public rotation: rotationOptions;
  public timescale: timescaleOptions;
  public karaoke: karaokeOptions;

  constructor(player: Player) {
    this.player = player;
    this.volume = 1.0;
    this.equalizer = [];
    this.timescale = null;
    this.vibrato = null;
    this.rotation = null;
    this.karaoke = null;
  }

  /** Sets the equalizer bands and updates the filters. */
  public setEqualizer(bands: Band[]): Filters {
    this.equalizer = bands;
    this.updateFilters();
    return this;
  }

  /** Applies the bass boost filter. */
  public bassBoost(): Filters {
    const { setEqualizer } = this;
    const equalizer = [
        { bands: 0, gain: 0.65 },
        { bands: 1, gain: 0.45 },
        { bands: 2, gain: -0.45 },
        { bands: 3, gain: -0.65 },
        { bands: 4, gain: -0.35 },
        { bands: 5, gain: 0.45 },
        { bands: 6, gain: 0.55 },
        { bands: 7, gain: 0.6 },
        { bands: 8, gain: 0.6 },
        { bands: 9, gain: 0.6 },
        { bands: 10, gain: 0 },
        { bands: 11, gain: 0 },
        { bands: 12, gain: 0 },
        { bands: 13, gain: 0 },
    ];

    setEqualizer(equalizer);
    return this;
  }

  /** Applies the nightcore filter. */
  public nightcore(): Filters {
    const { setTimescale } = this;
    const timescale: timescaleOptions = {
      speed: 1.1,
      pitch: 1.125,
      rate: 1.05,
    };
  
    setTimescale(timescale);
    return this;
  }

  /** Applies the slow motion filter. */
  public slowmo(): Filters {
    const { setTimescale } = this;
    const timescale: timescaleOptions = {
      speed: 0.5,
      pitch: 1.0,
      rate: 0.8,
    };
    
    setTimescale(timescale);
    return this;
  }

  /** Applies the soft filter. */
  public soft(): Filters {
    const { setEqualizer } = this;
    const equalizer: Band[] = [
      { bands: 0, gain: 0 },
      { bands: 1, gain: 0 },
      { bands: 2, gain: 0 },
      { bands: 3, gain: 0 },
      { bands: 4, gain: 0 },
      { bands: 5, gain: 0 },
      { bands: 6, gain: 0 },
      { bands: 7, gain: 0 },
      { bands: 8, gain: -0.25 },
      { bands: 9, gain: -0.25 },
      { bands: 10, gain: -0.25 },
      { bands: 11, gain: -0.25 },
      { bands: 12, gain: -0.25 },
      { bands: 13, gain: -0.25 },
    ];
      
    setEqualizer(equalizer);
    return this;
  }

  /** Applies the tv filter. */
  public tv(): Filters {
    const { setEqualizer } = this;
    const equalizer: Band[] = [
      { bands: 0, gain: 0 },
      { bands: 1, gain: 0 },
      { bands: 2, gain: 0 },
      { bands: 3, gain: 0 },
      { bands: 4, gain: 0 },
      { bands: 5, gain: 0 },
      { bands: 6, gain: 0 },
      { bands: 7, gain: 0.65 },
      { bands: 8, gain: 0.65 },
      { bands: 9, gain: 0.65 },
      { bands: 10, gain: 0.65 },
      { bands: 11, gain: 0.65 },
      { bands: 12, gain: 0.65 },
      { bands: 13, gain: 0.65 },
    ];
    
    setEqualizer(equalizer);
    return this;
  }

  /** Applies the treble bass filter. */
  public trebleBass(): Filters {
    const { setEqualizer } = this;
    const equalizer: Band[] = [
      { bands: 0, gain: 0.6 },
      { bands: 1, gain: 0.67 },
      { bands: 2, gain: 0.67 },
      { bands: 3, gain: 0 },
      { bands: 4, gain: -0.5 },
      { bands: 5, gain: 0.15 },
      { bands: 6, gain: -0.45 },
      { bands: 7, gain: 0.23 },
      { bands: 8, gain: 0.35 },
      { bands: 9, gain: 0.45 },
      { bands: 10, gain: 0.55 },
      { bands: 11, gain: 0.6 },
      { bands: 12, gain: 0.55 },
      { bands: 13, gain: 0 },
    ];
    
    setEqualizer(equalizer);
    return this;
  }

  /** Applies the vaporwave filter. */
  public vaporwave(): Filters {
    const { setEqualizer, setTimescale } = this;

    const equalizer = [
        { bands: 0, gain: 0 },
        { bands: 1, gain: 0 },
        { bands: 2, gain: 0 },
        { bands: 3, gain: 0 },
        { bands: 4, gain: 0 },
        { bands: 5, gain: 0 },
        { bands: 6, gain: 0 },
        { bands: 7, gain: 0 },
        { bands: 8, gain: 0.15 },
        { bands: 9, gain: 0.15 },
        { bands: 10, gain: 0.15 },
        { bands: 11, gain: 0.15 },
        { bands: 12, gain: 0.15 },
        { bands: 13, gain: 0.15 },
    ];

    setEqualizer(equalizer);
    setTimescale({ pitch: 0.55 });
    return this;
  }

  public setKaraoke(karaoke?: karaokeOptions): Filters {
    this.karaoke = karaoke || null;
    this.updateFilters();
    return this;
  }

  public setTimescale(timescale?: timescaleOptions): Filters {
    this.timescale = timescale || null;
    this.updateFilters();
    return this;
  }

  public setVibrato(vibrato?: vibratoOptions): Filters {
    this.vibrato = vibrato || null;
    this.updateFilters();
    return this;
  }

  public setRotation(rotation?: rotationOptions): Filters {
    this.rotation = rotation || null;
    this.updateFilters();

    return this;
  }

  public clearFilters(): Filters {
    this.player.filters = new Filters(this.player);
    this.updateFilters();
    return this;
  }


  public updateFilters(): Filters {
    const { equalizer, karaoke, timescale, vibrato, rotation, volume } = this;

    this.player.node.rest.updatePlayer({
      guildId: this.player.guildId,
      data: {
        filters: { equalizer, karaoke, timescale, vibrato, rotation, volume }
      }
    })
    return this;
  }
}

interface Band {
  bands: number;
  gain: number;
}

interface timescaleOptions {
  speed?: number;
  pitch?: number;
  rate?: number;
}

interface vibratoOptions {
  frequency: number;
  depth: number;
}

interface rotationOptions {
  rotationHz: number;
}

interface karaokeOptions {
  level?: number;
  monoLevel?: number;
  filterBand?: number;
  filterWidth?: number;
}