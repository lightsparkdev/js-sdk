
import React from 'react';
import ReactDOM from 'react-dom';
import CurrencyAmount from '../components/CurrencyAmount';

export const updateWalletBalances = async () => {
    const { balances } = await getWalletBalances();
    if (!balances) {
        return
    }
    // TODO: Use the right react component to display the balances.
    ReactDOM.render(<CurrencyAmount amount={balances.viewerBalance} />, document.getElementById("viewer-balance")!);
    ReactDOM.render(<CurrencyAmount amount={balances.viewerBalance} />, document.getElementById("creator-balance")!);
    // document.getElementById("viewer-balance")!.lastChild!.textContent = balances.viewerBalance.toString();
    // document.getElementById("creator-balance")!.lastChild!.textContent = balances.creatorBalance.toString();
}

const promisifyMessage = (message: any) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            resolve(response)
        })
    })
};

const getWalletBalances = () => {
    return promisifyMessage({ id: "get_streaming_wallet_balances" }) as Promise<{ balances: any}>;
};
