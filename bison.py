import discord

class Bison(discord.Client):

    async def on_ready(self):
        print('Logged on as {0}!'.format(self.user))

    async def on_message(self, message):
        print('Message from {0.author}: {0.content}'.format(message))

client = Bison()
client.run('NzUzNzcwNzc1MzA3MzU0MjM1.X1rBvQ.DquZrHCe9CD3ow9ja32zVyuQVxQ')