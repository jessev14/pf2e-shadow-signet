const moduleID = 'pf2e-shadow-signet';

const lg = x => console.log(x);


Hooks.once('init', () => {
    libWrapper.register(moduleID, 'CONFIG.PF2E.Item.documentClasses.spell.prototype.rollAttack.', promptTargetStat, 'WRAPPER');
});


async function promptTargetStat(wrapped, event, attackNumber = 1, context = {}) {
    const statistic = this.spellcasting?.statistic;
    const isSignet = this.actor.items.find(i => i.name === 'Shadow Signet')?.isEquipped; // TODO: more robust mechanism for checking if signet is applicable. isInvested
    if (statistic && isSignet) {
        let slug;
        await Dialog.wait({
            title: 'Shadow Signet',
            content: `
                <style>
                    .dialog .dialog-buttons {
                        flex-direction: column;
                    }
                </style>
            `,
            buttons: {
                ac: {
                    label: 'AC'
                },
                fortitude: {
                    label: 'Fortitude',
                    callback: () => slug = 'fortitude'
                },
                reflex: {
                    label: 'Reflex',
                    callback: () => slug = 'reflex'
                },
            },
            default: 'ac'
        }, { width: 200 });

        const ogRoll = statistic.check.roll;
        statistic.check.roll = async function (args = {}) {
            if (slug) args.dc = { slug };
            else args.dc = {};
            await ogRoll.call(this, args);
            statistic.check.roll = ogRoll;
        }
    }

    return wrapped(event, attackNumber, context);
}
