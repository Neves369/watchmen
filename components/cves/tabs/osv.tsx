import { Button } from '~/components/Button';
import { useCallback, useState } from 'react';
import { Container } from '~/components/Container';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';

export default function OSV() {
  const [packageName, setPackageName] = useState('');
  const [packageEcosystem, setPackageEcosystem] = useState('');
  const [packageVersion, setPackageVersion] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [commitHash, setCommitHash] = useState('');
  const [searchType, setSearchType] = useState('package');

  const handleSearch = async () => {
    // Validar se pelo menos um campo de busca foi preenchido
    if (searchType === 'package' && (!packageName || !packageEcosystem || !packageVersion)) {
      setError('Por favor, preencha o nome do pacote, o ecossistema e a versão.');
      return;
    }
    if (searchType === 'commit' && !commitHash) {
      setError('Por favor, preencha o hash do commit.');
      return;
    }

    setLoading(true);
    setResults(null);
    setError(null);

    // Corpo da requisição POST
    let payload = {};
    if (searchType === 'package') {
      payload = {
        package: {
          name: packageName,
          ecosystem: packageEcosystem,
        },
        version: packageVersion,
      };
    } else {
      // searchType === 'commit'
      payload = {
        commit: commitHash,
      };
    }

    try {
      const response = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      console.log('teste: ', data.vulns);
      setResults(data.vulns);
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSearchType = () => {
    // Alterna o tipo de busca e limpa os campos de entrada
    setSearchType(searchType === 'package' ? 'commit' : 'package');
    setPackageName('');
    setPackageEcosystem('');
    setPackageVersion('');
    setCommitHash('');
    setError(null);
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        onPress={() => {}}
        className="my-2 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-roboto text-xl font-bold text-white">{item.id}</Text>
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-[#00C851]" />
            <Text className="font-roboto text-sm font-medium text-[#00C851]">teste</Text>
          </View>
        </View>
          <Text className="font-roboto text-sm  text-white">{item.summary}</Text>
      </TouchableOpacity>
    );
  }, []);

  return (
    <>
      <Container>
        <View className="flex-1">
          <Button
            style={{
              width: 150,
              marginBottom: 10,
              alignSelf: searchType !== 'package' ? 'flex-end' : 'flex-start',
              backgroundColor: searchType !== 'package' ? '#ec2c39ff' : '#2196f3',
              borderColor: searchType !== 'package' ? '#ec2c39ff' : '#2196f3',

            }}
            onPress={toggleSearchType}
            title={`Por ${searchType === 'package' ? 'Pacote' : 'Commit'}`}
          />

          {/* Formulário para buscar por pacote e versão */}
          {searchType === 'package' && (
            <View className="rounded-lg bg-[#222] p-5 ">
              <TextInput
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                }}
                placeholderTextColor="#aaa"
                keyboardType="default"
                onChangeText={setPackageName}
                value={packageName}
                placeholder="Nome do Pacote (ex: lodash)"
              />
              <TextInput
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                }}
                placeholderTextColor="#aaa"
                keyboardType="default"
                onChangeText={setPackageEcosystem}
                value={packageEcosystem}
                placeholder="Ecossistema (ex: npm)"
              />
              <TextInput
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                }}
                placeholderTextColor="#aaa"
                keyboardType="default"
                onChangeText={setPackageVersion}
                value={packageVersion}
                placeholder="Versão (ex: 4.17.21)"
              />
            </View>
          )}

          {/* Formulário para buscar por commit hash */}
          {searchType === 'commit' && (
            <View className="rounded-lg bg-[#222] p-5 ">
              <TextInput
                style={{
                  backgroundColor: '#333',
                  color: '#fff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                }}
                placeholderTextColor="#aaa"
                keyboardType="default"
                onChangeText={setCommitHash}
                value={commitHash}
                placeholder="Commit Hash (ex: 6879efc2c1596d11a6a6ad296f80063b558d5e0f)"
              />
            </View>
          )}

          <Button
            style={{ marginTop: 10 }}
            title="INICIAR SCAN"
            onPress={() => {
              handleSearch();
            }}
          />
          <FlatList
            data={results}
            numColumns={1}
            keyExtractor={(item) => item.ip}
            renderItem={renderItem}
            contentContainerStyle={{ width: '100%', alignSelf: 'center', paddingVertical: 20 }}
          />
        </View>
      </Container>
    </>
  );
}
