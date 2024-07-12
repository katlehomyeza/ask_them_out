const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/saveProposal', (req, res) => {
    proposal=req.body
    const proposalId = Date.now().toString(); // Simple ID generation
    proposal.id = proposalId;

    fs.appendFile('proposals.txt', JSON.stringify(proposal) + '\n', err => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send(`Proposal saved successfully with ID: ${proposalId}`);
        }
    });
});

app.get('/getProposals', (req, res) => {
    fs.readFile('proposals.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            const proposals = data.trim().split('\n').map(line => JSON.parse(line));
            res.status(200).json(proposals);
        }
    });
});

app.delete('/deleteProposal', (req, res) => {
    const index = req.body.index;
    fs.readFile('proposals.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            const proposals = data.trim().split('\n');
            if (index >= 0 && index < proposals.length) {
                proposals.splice(index, 1);
                fs.writeFile('proposals.txt', proposals.join('\n') + '\n', err => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.status(200).send('Proposal deleted successfully');
                    }
                });
            } else {
                res.status(400).send('Invalid proposal index');
            }
        }
    });
});

app.get('/proposal/:proposalId', (req, res) => {
    const proposalId = req.params.proposalId;

    fs.readFile('proposals.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const proposals = data.trim().split('\n').map(line => JSON.parse(line));
        const proposal = proposals.find(p => p.id === proposalId);

        if (proposal) {
            res.sendFile(path.join(__dirname, 'public', 'quiz.html'));
        } else {
            res.status(404).send('Proposal not found');
        }
    });
});

app.get('/api/proposal/:proposalId', (req, res) => {
    const proposalId = req.params.proposalId;

    fs.readFile('proposals.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const proposals = data.trim().split('\n').map(line => JSON.parse(line));
        const proposal = proposals.find(p => p.id === proposalId);

        if (proposal) {
            res.status(200).json(proposal);
        } else {
            res.status(404).send('Proposal not found');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
