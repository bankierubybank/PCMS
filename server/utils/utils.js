async function escapeSpecial(string) {
    return await string.replace('[', '*').replace(']', '*');
}

module.exports = {
    escapeSpecial
};