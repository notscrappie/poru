"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manager = void 0;
const Track_1 = require("./Guild/Track");
const Node_1 = require("./Node/Node");
const Player_1 = require("./Guild/Player");
const events_1 = require("events");
/** The main hub for interacting with Lavalink via Automata. (shit taken from erela.js's repo, rip erela) */
class Manager extends events_1.EventEmitter {
    _nodes;
    /** The configuration options for the Manager. */
    options;
    /** A map of node identifiers to Node instances. */
    nodes;
    /** A map of guild IDs to Player instances. */
    players;
    /** The ID of the bot. */
    userId;
    /** A boolean indicating if the library has been initialized or not. */
    isActivated;
    /**
     * The function used to send packets.
     * @param {object} packet - The packet that needs to be sent.
     * @returns {void}
     */
    send;
    constructor(options) {
        super();
        this.nodes = new Map();
        this.players = new Map();
        this.options = options;
        this.isActivated = false;
        this._nodes = options.nodes;
    }
    /**
     * Initializes the manager.
     * @param {Client} client - The client object.
     * @returns {void}
     */
    init(client) {
        this.userId = client.user.id;
        for (const node of this._nodes)
            this.addNode(node);
        this.send = (packet) => {
            const guild = client.guilds.cache.get(packet.d.guild_id);
            guild.shard?.send(packet);
        };
        client.on('raw', (packet) => {
            this.packetUpdate(packet);
        });
        this.isActivated = true;
    }
    /**
     * Adds a new node to the node pool.
     * @param {NodeOptions} options - The options for the new node.
     * @returns {Node} The newly added node.
     */
    addNode({ name, host, password, port }) {
        const node = new Node_1.Node(this, { name, host, password, port }, this.options);
        this.nodes.set(name, node);
        node.connect();
        return node;
    }
    /**
     * Removes a node from the node pool.
     * @param {string} identifier - The identifier of the node that will be removed.
     * @returns {void}
     */
    removeNode(identifier) {
        const node = this.nodes.get(identifier);
        if (!node)
            return;
        node.disconnect();
        this.nodes.delete(identifier);
    }
    /**
     * Gets the least used nodes.
     * @returns {Node[]} An array of least used nodes.
     */
    get leastUsedNodes() {
        return [...this.nodes.values()]
            .filter((node) => node.isConnected)
            .sort((a, b) => a.penalties - b.penalties);
    }
    /**
     * Retrives a node.
     * @param {string} identifier - The identifier of the node to retrieve. Defaults to 'auto'.
     * @returns {Node[] | Node} The retrieved node(s).
     * @throws {Error} If there are no available nodes or the provided node identifier is not found.
     */
    getNode(identifier) {
        if (!this.nodes.size)
            throw new Error('There aren\'t any available nodes.');
        if (identifier === 'auto')
            return this.leastUsedNodes;
        const node = this.nodes.get(identifier);
        if (!node)
            throw new Error('Couldn\'t find the provided node identifier.');
        if (!node.isConnected)
            node.connect();
        return node;
    }
    /**
     * Creates a new player instance for the specified guild and connects to the least used node based on the provided region or overall system load.
     * @param {ConnectionOptions} options - The options for creating the player.
     * @returns {Player} The created player.
     * @throws {Error} If Automata was not initialized or there are no available nodes.
     */
    create(options) {
        if (!this.isActivated)
            throw new Error('Automata was not initialized in your ready event. Please initiate it by using the <AutomataManager>.init function.');
        let player = this.players.get(options.guildId);
        if (!player) {
            if (this.leastUsedNodes.length === 0)
                throw new Error('There aren\'t any nodes available.');
            const foundNode = this.nodes.get(options.region
                ? this.leastUsedNodes.find((node) => node.regions.includes(options.region.toLowerCase()))?.options.name
                : this.leastUsedNodes[0].options.name);
            if (!foundNode)
                throw new Error('There aren\'t any nodes available.');
            player = this.createPlayer(foundNode, options);
        }
        return player;
    }
    /**
     * Sends packet updates.
     * @private
     * @param {VoicePacket} packet - The voice packet that is received.
     * @returns {void}
     */
    packetUpdate(packet) {
        if (!['VOICE_STATE_UPDATE', 'VOICE_SERVER_UPDATE'].includes(packet.t))
            return;
        const player = this.players.get(packet.d.guild_id);
        if (!player)
            return;
        switch (packet.t) {
            case 'VOICE_SERVER_UPDATE':
                player.connection.setServersUpdate(packet.d);
                break;
            case 'VOICE_STATE_UPDATE':
                if (packet.d.user_id !== this.userId)
                    return;
                player.connection.setStateUpdate(packet.d);
                if (player.isPaused)
                    player.pause(false);
                break;
            default:
                break;
        }
    }
    /**
     * Creates a new player using the node and options provided by the create() function.
     * @private
     * @param {Node} node - The node to create the player with.
     * @param {ConnectionOptions} options - THe options for creating the player.
     * @returns {Player} The created player.
     */
    createPlayer(node, options) {
        const player = new Player_1.Player(this, node, options);
        this.players.set(options.guildId, player);
        player.connect(options);
        return player;
    }
    /**
     * Removes a connection.
     * @param {string} guildId - The ID of the guild to remove the connection from.
     * @returns {void}
     */
    removeConnection(guildId) {
        this.players.get(guildId)?.destroy();
    }
    /**
     * Resolves the provided query.
     * @param {ResolveOptions} options - The options for resolving the query.
     * @param {Node} node - The node to use for resolving. Defaults to the least used node.
     * @returns {Promise<ResolveResult>} A promise that returns the loadType, mapped tracks and playlist info (when possible).
     * @throws {Error} If Automata has not been initialized or there are no available nodes.
     */
    async resolve({ query, source, requester }, node) {
        if (!this.isActivated)
            throw new Error('Automata has not been initialized. Initiate Automata using the <Manager>.init() function in your ready.js.');
        node = node ?? this.leastUsedNodes?.[0];
        if (!node)
            throw Error('There are no available nodes.');
        const regex = /^https?:\/\//;
        const identifier = regex.test(query) ? query : `${source ?? 'dzsearch'}:${query}`;
        const res = await node.rest.get(`/v3/loadtracks?identifier=${encodeURIComponent(identifier)}`);
        const mappedTracks = res.tracks.map((track) => new Track_1.AutomataTrack(track, requester)) || [];
        const finalResult = {
            loadType: res.loadType,
            tracks: mappedTracks,
            playlistInfo: res.playlistInfo || undefined,
        };
        return finalResult;
    }
    /**
     * Sends a GET request to the Lavalink node to decode the provided track.
     * @param {string} track - The track to decode.
     * @param {Node} node - The node to send the request to. Defaults to the least used node.
     * @returns {Promise<unknown>} A promise that resolves to the decoded track.
     */
    async decodeTrack(track, node) {
        const targetNode = node ?? this.leastUsedNodes[0];
        const request = await targetNode.rest.get(`/v3/decodetrack?encodedTrack=${encodeURIComponent(track)}`);
        return request;
    }
    /**
     * Sends a POST request to the Lavalink node to decode the provided tracks.
     * @param {string[]} tracks - The tracks to decode.
     * @param {Node} node - The node to send the request to. Defaults to the least used node.
     * @returns {Promise<unknown>} A promise that resolves to the decoded tracks.
     */
    async decodeTracks(tracks, node) {
        const targetNode = node ?? this.leastUsedNodes[0];
        const request = await targetNode.rest.post('/v3/decodetracks', tracks);
        return request;
    }
    /**
     * Sends a GET request to the Lavalink node to get information regarding the node.
     * @param {string} name - The name of the node.
     * @returns {Promise<unknown>} A promise that resolves to the information regarding the node.
     */
    async getLavalinkInfo(name) {
        const node = this.nodes.get(name);
        const request = await node.rest.get('/v3/info');
        return request;
    }
    /**
     * Sends a GET request to the Lavalink node to get information regarding the status of the node.
     * @param {string} name - The name of the node.
     * @returns {Promise<unknown>} A promise that resolves to the status information of the node.
     */
    async getLavalinkStatus(name) {
        const node = this.nodes.get(name);
        const request = await node.rest.get('/v3/stats');
        return request;
    }
    /**
     * Retrieves the player from a server using the provided guildId of the specific server.
     * @param {string} guildId - The ID of the guild.
     * @returns {Player | undefined} The retrieved player or undefined if not found.
     */
    get(guildId) {
        return this.players.get(guildId);
    }
}
exports.Manager = Manager;
//# sourceMappingURL=Manager.js.map