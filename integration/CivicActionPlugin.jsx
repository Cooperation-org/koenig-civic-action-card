import React from 'react';
import {$createCivicActionNode, CivicActionNode, INSERT_CIVIC_ACTION_COMMAND} from '../nodes/CivicActionNode';
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_HIGH
} from 'lexical';
import {INSERT_CARD_COMMAND} from './KoenigBehaviourPlugin';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const CivicActionPlugin = () => {
    const [editor] = useLexicalComposerContext();

    React.useEffect(() => {
        if (!editor.hasNodes([CivicActionNode])){
            console.error('CivicActionPlugin: CivicActionNode not registered'); // eslint-disable-line no-console
            return;
        }
        return mergeRegister(
            editor.registerCommand(
                INSERT_CIVIC_ACTION_COMMAND,
                async (dataset) => {
                    const selection = $getSelection();

                    if (!$isRangeSelection(selection)) {
                        return false;
                    }

                    const focusNode = selection.focus.getNode();
                    if (focusNode !== null) {
                        const cardNode = $createCivicActionNode(dataset);
                        editor.dispatchCommand(INSERT_CARD_COMMAND, {cardNode});
                    }

                    return true;
                },
                COMMAND_PRIORITY_HIGH
            )
        );
    }, [editor]);

    return null;
};

export default CivicActionPlugin;
