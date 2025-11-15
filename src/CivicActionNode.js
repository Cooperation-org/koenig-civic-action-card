import {generateDecoratorNode} from '@tryghost/kg-default-nodes';

export class CivicActionNode extends generateDecoratorNode({
    nodeType: 'civic-action',
    properties: [
        {name: 'actionId', default: ''},
        {name: 'source', default: 'community'},
        {name: 'title', default: ''},
        {name: 'description', default: ''},
        {name: 'eventType', default: ''},
        {name: 'eventDate', default: ''},
        {name: 'location', default: ''},
        {name: 'imageUrl', default: ''},
        {name: 'takeActionUrl', default: ''},
        {name: 'externalUrl', default: ''},
        {name: 'zipcode', default: ''},
        {name: 'isVirtual', default: false},
        {name: 'sourceMeta', default: null}
    ]
}) {
    constructor({actionId, source, title, description, eventType, eventDate, location, imageUrl, takeActionUrl, externalUrl, zipcode, isVirtual, sourceMeta} = {}, key) {
        super(key);
        this.__actionId = actionId || '';
        this.__source = source || 'community';
        this.__title = title || '';
        this.__description = description || '';
        this.__eventType = eventType || '';
        this.__eventDate = eventDate || '';
        this.__location = location || '';
        this.__imageUrl = imageUrl || '';
        this.__takeActionUrl = takeActionUrl || '';
        this.__externalUrl = externalUrl || '';
        this.__zipcode = zipcode || '';
        this.__isVirtual = isVirtual || false;
        this.__sourceMeta = sourceMeta || null;
    }

    getDataset() {
        const self = this.getLatest();
        return {
            actionId: self.__actionId,
            source: self.__source,
            title: self.__title,
            description: self.__description,
            eventType: self.__eventType,
            eventDate: self.__eventDate,
            location: self.__location,
            imageUrl: self.__imageUrl,
            takeActionUrl: self.__takeActionUrl,
            externalUrl: self.__externalUrl,
            zipcode: self.__zipcode,
            isVirtual: self.__isVirtual,
            sourceMeta: self.__sourceMeta
        };
    }

    static importJSON(serializedNode) {
        const {actionId, source, title, description, eventType, eventDate, location, imageUrl, takeActionUrl, externalUrl, zipcode, isVirtual, sourceMeta} = serializedNode;
        return new this({actionId, source, title, description, eventType, eventDate, location, imageUrl, takeActionUrl, externalUrl, zipcode, isVirtual, sourceMeta});
    }

    exportJSON() {
        return {
            type: 'civic-action',
            version: 1,
            actionId: this.actionId,
            source: this.source,
            title: this.title,
            description: this.description,
            eventType: this.eventType,
            eventDate: this.eventDate,
            location: this.location,
            imageUrl: this.imageUrl,
            takeActionUrl: this.takeActionUrl,
            externalUrl: this.externalUrl,
            zipcode: this.zipcode,
            isVirtual: this.isVirtual,
            sourceMeta: this.sourceMeta
        };
    }

    exportDOM() {
        const element = document.createElement('figure');
        element.classList.add('kg-civic-action-card');
        element.setAttribute('data-action-id', this.actionId);
        element.setAttribute('data-source', this.source);

        const loading = document.createElement('div');
        loading.classList.add('civic-action-loading');
        loading.textContent = 'Loading civic action...';
        element.appendChild(loading);

        return {element};
    }

    static importDOM() {
        return {
            figure: (domNode) => {
                if (!domNode.classList.contains('kg-civic-action-card')) {
                    return null;
                }

                const actionId = domNode.getAttribute('data-action-id');
                const source = domNode.getAttribute('data-source') || 'community';

                if (!actionId) {
                    return null;
                }

                return {
                    conversion: () => ({node: new CivicActionNode({actionId, source})}),
                    priority: 1
                };
            }
        };
    }

    isEmpty() {
        return !this.actionId;
    }
}

export const $createCivicActionNode = (dataset) => {
    return new CivicActionNode(dataset);
};

export function $isCivicActionNode(node) {
    return node instanceof CivicActionNode;
}
