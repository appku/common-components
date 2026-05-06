import message from 'antd/es/message';

const messageByKind = {
    error: 'error',
    failure: 'error',
    none: 'open',
    notice: 'info',
    ok: 'success',
    primary: 'info',
    success: 'success',
    warning: 'warning'
};

export class AppKuToaster {
    show (content, kind = 'none', options = {}) {
        const method = messageByKind[kind] || 'open';

        if (method === 'open') {
            return message.open({
                content,
                ...options
            });
        }

        return message[method]({
            content,
            ...options
        });
    }

    destroy (key) {
        message.destroy(key);
    }
}

export const appKuToaster = new AppKuToaster();
