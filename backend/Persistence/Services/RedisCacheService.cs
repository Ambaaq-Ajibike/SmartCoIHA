using Application.Services.Interfaces;
using StackExchange.Redis;
using System.Text.Json;


namespace Persistence.Services
{
    public class RedisCacheService(IConnectionMultiplexer redis) : ICacheService
    {
        private readonly IDatabase _database = redis.GetDatabase();

        public async Task<T?> GetAsync<T>(string key)
        {
            var value = await _database.StringGetAsync(key);

            if (value.IsNullOrEmpty)
                return default;

            return JsonSerializer.Deserialize<T>(value.ToString());
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var serialized = JsonSerializer.Serialize(value);

            if (expiry.HasValue)
            {
                await _database.StringSetAsync(key, serialized, expiry.Value, When.Always);
            }
            else
            {
                await _database.StringSetAsync(key, serialized, null, When.Always);
            }
        }

        public async Task RemoveAsync(string key)
        {
            await _database.KeyDeleteAsync(key);
        }
    }
}
