namespace Bhop {
  export enum Button {
    Attack = 1 << 0,
    Jump = 1 << 1,
    Duck = 1 << 2,
    Forward = 1 << 3,
    Back = 1 << 4,
    Use = 1 << 5,
    Cancel = 1 << 6,
    Left = 1 << 7,
    Right = 1 << 8,
    MoveLeft = 1 << 9,
    MoveRight = 1 << 10,
    Attack2 = 1 << 11,
    Run = 1 << 12,
    Reload = 1 << 13,
    Alt1 = 1 << 14,
    Alt2 = 1 << 15,
    Score = 1 << 16,
    Speed = 1 << 17,
    Walk = 1 << 18,
    Zoom = 1 << 19,
    Weapon1 = 1 << 20,
    Weapon2 = 1 << 21,
    BullRush = 1 << 22, // ...what?
    Grenade1 = 1 << 23,
    Grenade2 = 1 << 24,
  }

  export enum EntityFlag {
    OnGround = 1 << 0,
    Ducking = 1 << 1,
    WaterJump = 1 << 2,
    OnTrain = 1 << 3,
    InRain = 1 << 4,
    Frozen = 1 << 5,
    AtControls = 1 << 6,
    Client = 1 << 7,
    FakeClient = 1 << 8,
    InWater = 1 << 9,
    Fly = 1 << 10,
    Swim = 1 << 11,
    Conveyor = 1 << 12,
    Npc = 1 << 13,
    GodMode = 1 << 14,
    NoTarget = 1 << 15,
    AimTarget = 1 << 16,
    PartialGround = 1 << 17,
    StaticProp = 1 << 18,
    Graphed = 1 << 19,
    Grenade = 1 << 20,
    StepMovement = 1 << 21,
    DontTouch = 1 << 22,
    BaseVelocity = 1 << 23,
    WorldBrush = 1 << 24,
    Object = 1 << 25,
    KillMe = 1 << 26,
    OnFire = 1 << 27,
    Dissolving = 1 << 28,
    TransRagdoll = 1 << 29,
    UnblockableByPlayer = 1 << 30,
    Freezing = 1 << 31,
  }

  export class TickData {
    readonly position = new Facepunch.Vector3();
    readonly angles = new Facepunch.Vector2();
    tick = -1;
    buttons: Button;
    flags: EntityFlag;
    movetype: number;

    getEyeHeight(): number {
      return (this.flags & EntityFlag.Ducking) != 0 ? 46 : 64;
    }
  }

  export class ReplayFile {
    private readonly reader: BinaryReader;
    private readonly firstTickOffset: number;
    private readonly tickSize: number;

    readonly header: string;
    readonly mapName: string;
    readonly style: number;
    readonly track: number;
    readonly time: number;
    readonly steamid: number;
    readonly tickRate: number;
    readonly preframes: number;
    readonly size: number;

    constructor(data: ArrayBuffer) {
      const reader = (this.reader = new BinaryReader(data));

      this.header = reader.readLine();
      this.mapName = reader.readString();
      this.style = reader.readUint8();
      this.track = reader.readUint8();
      this.preframes = reader.readInt32();
      this.size = reader.readInt32() + 64*4;
      this.time = reader.readFloat32();
      this.steamid = reader.readInt32();

      if(this.mapName.indexOf("bhop_") == 0 && this.header == "9:{SHAVITREPLAYFORMAT}{FINAL}"){
        /**
         * -----BHOP-----
         * 在CS起源中，通常的服务器配置为
         * Tickrate: 100
         * TickSize: 40
         * 在最新版ShavitTimer中，Timer头为
         * 9:{SHAVITREPLAYFORMAT}{FINAL}
         *
         * 若想恢复CSGO使用，请按以下参数修改
         * this.tickRate = 128;
         * this.firstTickOffset = reader.getOffset();
         * this.tickSize = 32;
         */
        this.tickRate = 100;
        this.firstTickOffset = reader.getOffset() + 16;
        this.tickSize = 40;
      }else
      if(this.mapName.indexOf("surf_") == 0 && this.header == "10:{SHAVITREPLAYFORMAT}{FINAL}"){
        /**
         * -----SURF-----
         * 注：仅适用于 bhopppp/Shavit-Surf-Timer
         * 此为支持旧版 Shavit-Surf-Timer（V10) 回放文件
         * 在CS起源中，通常的服务器配置为
         * Tickrate: 66
         * TickSize: 44
         * 在该版本SurfTimer中，Timer头为
         * 10:{SHAVITREPLAYFORMAT}{FINAL}
         */
        this.tickRate = 66;
        this.firstTickOffset = reader.getOffset() + 17;
        this.tickSize = 44;
        document.getElementsByClassName("sync-outer")[0].classList.add("surf");
        document.getElementsByClassName("speed-outer")[0].classList.add("surf");
        document.getElementsByClassName("speed-outer")[0].classList.remove("stat");
      }else
      if(this.mapName.indexOf("surf_") == 0 && this.header == "11:{SHAVITREPLAYFORMAT}{FINAL}"){
        /**
         * -----SURF-----
         * 注：仅适用于 bhopppp/Shavit-Surf-Timer
         * 在CS起源中，通常的服务器配置为
         * Tickrate: 66
         * TickSize: 44
         * 在最新版SurfTimer中，Timer头为
         * 11:{SHAVITREPLAYFORMAT}{FINAL}
         */
        this.tickRate = 66;
        this.firstTickOffset = reader.getOffset() + 10;
        this.tickSize = 44;
        document.getElementsByClassName("sync-outer")[0].classList.add("surf");
        document.getElementsByClassName("speed-outer")[0].classList.add("surf");
        document.getElementsByClassName("speed-outer")[0].classList.remove("stat");
      }
      else{
        throw new Error("Cannot parse map!\nPlease check your replay file.");
      }
    }

    getTickData(tick: number, data?: TickData): TickData {
      try{
        if (data === undefined) data = new TickData();

        data.tick = tick;

        const reader = this.reader;
        reader.seek(
          this.firstTickOffset + this.tickSize * tick,
          SeekOrigin.Begin
        );

        reader.readVector3(data.position);
        reader.readVector2(data.angles);
        data.buttons = reader.readInt32();
        data.flags = reader.readInt32();
        data.movetype = reader.readInt32();
      }catch(_){
        return new TickData();
      }finally{
        return data;
      }
    }

    clampTick(tick: number): number {
      return tick < 0 ? 0 : tick >= this.size ? this.size - 1 : tick;
    }
  }
}
